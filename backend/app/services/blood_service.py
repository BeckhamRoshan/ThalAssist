import requests
import re
from bs4 import BeautifulSoup
import logging
from typing import Dict, Optional, List
import json
from datetime import datetime
from .utils.blood_mappings import BLOOD_GROUP_MAPPING, COMPONENT_MAPPING
from .utils.fallback_data import FALLBACK_BLOOD_BANKS

logger = logging.getLogger(__name__)

class BloodBankService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        self.working_base_url = None
        self._test_and_set_working_url()

    def _test_and_set_working_url(self):
        """Find and set the working eRaktKosh URL"""
        test_urls = [
            "https://eraktkosh.mohfw.gov.in",
            "https://eraktkosh.mohfw.gov.in/eraktkoshPortal",
            "https://www.eraktkosh.in"
        ]
        
        for url in test_urls:
            try:
                resp = self.session.get(url, timeout=10)
                if resp.status_code == 200 and len(resp.text) > 100:
                    self.working_base_url = url
                    logger.info(f"Working eRaktKosh URL found: {url}")
                    return
            except Exception as e:
                logger.debug(f"URL {url} failed: {e}")
        
        logger.warning("No working eRaktKosh URL found, using fallback data only")

    def test_connectivity(self) -> Dict:
        """Test eRaktKosh connectivity and find working endpoints"""
        test_urls = [
            "https://eraktkosh.mohfw.gov.in/BLDAHIMS/bloodbank",
            "https://eraktkosh.mohfw.gov.in/eraktkoshPortal", 
            "https://eraktkosh.mohfw.gov.in",
            "https://www.eraktkosh.in"
        ]
        
        results = {}
        
        for url in test_urls:
            try:
                resp = self.session.get(url, timeout=10)
                results[url] = {
                    "status": resp.status_code,
                    "accessible": resp.status_code == 200,
                    "content_length": len(resp.text),
                    "has_blood_related_content": self._check_blood_content(resp.text),
                    "potential_endpoints": self._extract_endpoints(resp.text)
                }
                
                # If this URL works, try to find specific endpoints
                if resp.status_code == 200:
                    results[url]["detailed_analysis"] = self._analyze_page_structure(resp.text)
                    
            except Exception as e:
                results[url] = {
                    "status": None,
                    "accessible": False,
                    "error": str(e)
                }
        
        return results

    def _check_blood_content(self, html: str) -> bool:
        """Check if page contains blood-related content"""
        blood_keywords = ["blood", "stock", "availability", "donor", "transfusion", "bank"]
        html_lower = html.lower()
        return sum(1 for keyword in blood_keywords if keyword in html_lower) >= 3

    def _extract_endpoints(self, html: str) -> List[str]:
        """Extract potential API endpoints from HTML"""
        endpoints = []
        
        # Look for common API patterns
        api_patterns = [
            r'"/api/[^"]*"',
            r"'/api/[^']*'",
            r'"/BLDAHIMS/[^"]*"',
            r"'/BLDAHIMS/[^']*'",
            r'"[^"]*bloodstock[^"]*"',
            r'"[^"]*search[^"]*"'
        ]
        
        for pattern in api_patterns:
            matches = re.findall(pattern, html)
            endpoints.extend([match.strip('"\'') for match in matches])
        
        return list(set(endpoints))[:10]  # Return unique endpoints, max 10

    def _analyze_page_structure(self, html: str) -> Dict:
        """Analyze page structure for scraping opportunities"""
        soup = BeautifulSoup(html, 'html.parser')
        
        analysis = {
            "forms": len(soup.find_all('form')),
            "select_elements": len(soup.find_all('select')),
            "input_elements": len(soup.find_all('input')),
            "potential_state_dropdown": False,
            "potential_district_dropdown": False,
            "ajax_calls": []
        }
        
        # Look for state/district dropdowns
        selects = soup.find_all('select')
        for select in selects:
            select_id = select.get('id', '').lower()
            select_name = select.get('name', '').lower()
            if any(keyword in select_id or keyword in select_name 
                   for keyword in ['state', 'stat']):
                analysis["potential_state_dropdown"] = True
            if any(keyword in select_id or keyword in select_name 
                   for keyword in ['district', 'dist']):
                analysis["potential_district_dropdown"] = True
        
        # Look for AJAX calls in scripts
        scripts = soup.find_all('script')
        for script in scripts:
            if script.string:
                ajax_patterns = ['$.ajax', '$.get', '$.post', 'XMLHttpRequest', 'fetch(']
                for pattern in ajax_patterns:
                    if pattern in script.string:
                        analysis["ajax_calls"].append(pattern)
        
        return analysis

    def try_eraktkosh_scraping(self, state: str, district: str, blood_group: str, component: str) -> Optional[Dict]:
        """Enhanced scraping with better endpoint detection"""
        if not self.working_base_url:
            return None
        
        try:
            # Try the main portal first
            portal_resp = self.session.get(self.working_base_url, timeout=10)
            if portal_resp.status_code != 200:
                return None
            
            soup = BeautifulSoup(portal_resp.text, 'html.parser')
            
            # Look for blood availability or stock links
            blood_links = []
            for link in soup.find_all('a', href=True):
                href = link.get('href', '').lower()
                text = link.get_text(strip=True).lower()
                
                if any(keyword in href or keyword in text 
                       for keyword in ['stock', 'availability', 'search', 'blood']):
                    full_url = href if href.startswith('http') else self.working_base_url + href
                    blood_links.append(full_url)
            
            # Try each blood-related link
            for link in blood_links[:5]:  # Try first 5 links
                try:
                    link_resp = self.session.get(link, timeout=10)
                    if link_resp.status_code == 200:
                        # Try to find and submit forms
                        form_result = self._try_form_submission(link_resp.text, link, state, district, blood_group, component)
                        if form_result:
                            return form_result
                            
                except Exception as e:
                    logger.debug(f"Failed to process link {link}: {e}")
                    continue
            
            return {
                "source": "scraping_attempted",
                "status": "no_forms_found",
                "links_tried": blood_links,
                "suggestion": "Manual navigation required"
            }
            
        except Exception as e:
            logger.error(f"Scraping error: {e}")
            return None

    def _try_form_submission(self, html: str, url: str, state: str, district: str, blood_group: str, component: str) -> Optional[Dict]:
        """Try to submit forms found on the page"""
        soup = BeautifulSoup(html, 'html.parser')
        forms = soup.find_all('form')
        
        for form in forms:
            try:
                action = form.get('action', '')
                method = form.get('method', 'get').lower()
                
                # Build form data
                form_data = {}
                for input_elem in form.find_all(['input', 'select']):
                    name = input_elem.get('name')
                    if not name:
                        continue
                    
                    name_lower = name.lower()
                    
                    # Try to match form fields to our data
                    if any(keyword in name_lower for keyword in ['state', 'stat']):
                        form_data[name] = self._find_state_code(state, input_elem)
                    elif any(keyword in name_lower for keyword in ['district', 'dist']):
                        form_data[name] = district
                    elif any(keyword in name_lower for keyword in ['blood', 'group']):
                        form_data[name] = self._normalize_blood_group(blood_group)
                    elif any(keyword in name_lower for keyword in ['component', 'type']):
                        form_data[name] = self._normalize_component(component)
                    elif input_elem.get('type') == 'hidden':
                        form_data[name] = input_elem.get('value', '')
                
                if form_data:
                    # Submit form
                    form_url = action if action.startswith('http') else url.split('?')[0].rsplit('/', 1)[0] + '/' + action
                    
                    if method == 'post':
                        resp = self.session.post(form_url, data=form_data, timeout=10)
                    else:
                        resp = self.session.get(form_url, params=form_data, timeout=10)
                    
                    if resp.status_code == 200:
                        # Try to parse results
                        result_data = self._parse_results_page(resp.text)
                        if result_data:
                            return {
                                "source": "form_submission",
                                "url": form_url,
                                "method": method,
                                "form_data": form_data,
                                "results": result_data
                            }
                        
            except Exception as e:
                logger.debug(f"Form submission failed: {e}")
                continue
        
        return None

    def _find_state_code(self, state: str, select_elem) -> str:
        """Find state code from select options"""
        if select_elem.name != 'select':
            return state
        
        options = select_elem.find_all('option')
        state_lower = state.lower()
        
        for option in options:
            value = option.get('value', '')
            text = option.get_text(strip=True).lower()
            
            if state_lower in text or text in state_lower:
                return value if value else text
        
        return state

    def _normalize_blood_group(self, blood_group: str) -> str:
        """Normalize blood group format"""
        bg_upper = blood_group.upper().strip()
        
        # Try exact match first
        for standard, variants in BLOOD_GROUP_MAPPING.items():
            if bg_upper in [v.upper() for v in variants]:
                return standard
        
        return blood_group

    def _normalize_component(self, component: str) -> str:
        """Normalize blood component format"""
        comp_upper = component.upper().strip()
        
        for standard, variants in COMPONENT_MAPPING.items():
            if comp_upper in [v.upper() for v in variants]:
                return standard
        
        return component

    def _parse_results_page(self, html: str) -> Optional[Dict]:
        """Parse results from eRaktKosh response"""
        soup = BeautifulSoup(html, 'html.parser')
        
        # Look for tables with blood bank data
        tables = soup.find_all('table')
        blood_banks = []
        
        for table in tables:
            rows = table.find_all('tr')
            if len(rows) < 2:  # Need header + at least one data row
                continue
            
            headers = [th.get_text(strip=True).lower() for th in rows[0].find_all(['th', 'td'])]
            
            # Check if this looks like a blood bank table
            if not any(keyword in ' '.join(headers) 
                      for keyword in ['blood', 'bank', 'hospital', 'availability']):
                continue
            
            for row in rows[1:]:
                cells = [td.get_text(strip=True) for td in row.find_all('td')]
                if len(cells) < 2:
                    continue
                
                bank_data = {}
                for i, cell in enumerate(cells):
                    if i < len(headers):
                        bank_data[headers[i]] = cell
                
                if bank_data:
                    blood_banks.append(bank_data)
        
        if blood_banks:
            return {
                "blood_banks": blood_banks,
                "total_found": len(blood_banks),
                "last_updated": datetime.now().isoformat()
            }
        
        return None

    def get_fallback_data(self, state: str, district: str, blood_group: str, component: str) -> Dict:
        """Get fallback blood bank data"""
        # Normalize inputs for matching
        state_key = None
        district_key = None
        
        # Find matching state (case-insensitive, partial match)
        for fb_state in FALLBACK_BLOOD_BANKS.keys():
            if (state.lower() in fb_state.lower() or 
                fb_state.lower() in state.lower() or
                any(word in fb_state.lower() for word in state.lower().split())):
                state_key = fb_state
                break
        
        if not state_key:
            return {
                "source": "fallback_database",
                "blood_banks": [],
                "message": f"No data available for {state}. Please contact local blood banks directly.",
                "suggestion": "Try searching for nearby major cities."
            }
        
        # Find matching district
        districts_data = FALLBACK_BLOOD_BANKS[state_key]
        for fb_district in districts_data.keys():
            if (district.lower() in fb_district.lower() or 
                fb_district.lower() in district.lower() or
                any(word in fb_district.lower() for word in district.lower().split())):
                district_key = fb_district
                break
        
        if not district_key:
            # Return all districts in the state as alternatives
            return {
                "source": "fallback_database",
                "blood_banks": [],
                "message": f"No specific data for {district} in {state}",
                "available_districts": list(districts_data.keys()),
                "suggestion": f"Try one of these districts: {', '.join(list(districts_data.keys())[:3])}"
            }
        
        # Filter blood banks by component availability
        all_banks = districts_data[district_key]
        filtered_banks = []
        
        for bank in all_banks:
            # Check if bank has the required component
            bank_components = bank.get("components", [])
            if any(self._component_matches(component, comp) for comp in bank_components):
                bank_copy = bank.copy()
                bank_copy.update({
                    "availability_status": "Contact for current stock",
                    "requested_component": component,
                    "requested_blood_group": blood_group,
                    "last_updated": "Static data - verify availability by calling"
                })
                filtered_banks.append(bank_copy)
        
        return {
            "source": "fallback_database",
            "blood_banks": filtered_banks,
            "total_banks": len(filtered_banks),
            "location": f"{district}, {state}",
            "disclaimer": "This is static reference data. Please contact blood banks directly for real-time availability.",
            "urgent_note": "For emergency needs, call multiple blood banks or visit hospitals directly."
        }

    def _component_matches(self, requested: str, available: str) -> bool:
        """Check if requested component matches available component"""
        req_norm = self._normalize_component(requested).lower()
        avail_norm = available.lower()
        
        return (req_norm in avail_norm or avail_norm in req_norm or
                any(variant.lower() in avail_norm 
                    for variants in COMPONENT_MAPPING.values() 
                    for variant in variants 
                    if self._normalize_component(variant).lower() == req_norm))

    def get_blood_availability(self, state: str, district: str, blood_group: str, component: str) -> Dict:
        """Main method to get blood availability with multiple strategies"""
        logger.info(f"Blood availability request: {state}, {district}, {blood_group}, {component}")
        
        result = {
            "request": {
                "state": state,
                "district": district,
                "blood_group": blood_group,
                "component": component,
                "timestamp": datetime.now().isoformat()
            },
            "strategies_attempted": []
        }
        
        # Strategy 1: Try eRaktKosh scraping
        try:
            scrape_result = self.try_eraktkosh_scraping(state, district, blood_group, component)
            if scrape_result and scrape_result.get("results"):
                result["strategies_attempted"].append({
                    "strategy": "eraktkosh_scraping",
                    "success": True,
                    "data": scrape_result
                })
                result["primary_result"] = scrape_result
                return result
            else:
                result["strategies_attempted"].append({
                    "strategy": "eraktkosh_scraping",
                    "success": False,
                    "reason": "No results found or form submission failed"
                })
        except Exception as e:
            result["strategies_attempted"].append({
                "strategy": "eraktkosh_scraping",
                "success": False,
                "error": str(e)
            })
        
        # Strategy 2: Fallback to static data
        try:
            fallback_result = self.get_fallback_data(state, district, blood_group, component)
            result["strategies_attempted"].append({
                "strategy": "fallback_database",
                "success": True,
                "data": fallback_result
            })
            result["primary_result"] = fallback_result
            
        except Exception as e:
            result["strategies_attempted"].append({
                "strategy": "fallback_database", 
                "success": False,
                "error": str(e)
            })
            
            # Final fallback
            result["primary_result"] = {
                "source": "error_fallback",
                "message": "Unable to fetch blood availability data",
                "recommendations": [
                    "Visit eRaktKosh portal directly: https://eraktkosh.mohfw.gov.in",
                    "Call local hospitals and blood banks",
                    "Contact Red Cross or other blood donation organizations",
                    "Check with nearby medical colleges"
                ],
                "emergency_contacts": {
                    "National Blood Transfusion Council": "011-23061462",
                    "Indian Red Cross": "011-23711551"
                }
            }
        
        return result