"""Fallback blood bank data for major cities"""

FALLBACK_BLOOD_BANKS = {
    "Tamil Nadu": {
        "Chennai": [
            {
                "name": "Government Stanley Medical College Hospital Blood Bank",
                "address": "Old Jail Road, Chennai - 600001",
                "phone": "044-25281351",
                "email": "bloodbank.stanley@tn.gov.in",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "TN-CH-001"
            },
            {
                "name": "Rajiv Gandhi Government General Hospital Blood Bank",
                "address": "Park Town, Chennai - 600003", 
                "phone": "044-25305000",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets", "Cryoprecipitate"],
                "timings": "24x7",
                "license": "TN-CH-002"
            },
            {
                "name": "Apollo Hospitals Blood Bank",
                "address": "Greams Lane, Chennai - 600006",
                "phone": "044-28293333",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "TN-CH-003"
            },
            {
                "name": "Voluntary Health Services Hospital Blood Bank",
                "address": "Adyar, Chennai - 600113",
                "phone": "044-24470102",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "TN-CH-004"
            },
            {
                "name": "Sri Ramachandra Medical Centre Blood Bank",
                "address": "Porur, Chennai - 600116",
                "phone": "044-45928000",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "TN-CH-005"
            }
        ],
        "Coimbatore": [
            {
                "name": "Coimbatore Medical College Hospital Blood Bank",
                "address": "Avinashi Road, Coimbatore - 641014",
                "phone": "0422-2570170",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "TN-CB-001"
            },
            {
                "name": "Kovai Medical Center and Hospital Blood Bank",
                "address": "99, Avinashi Road, Coimbatore - 641014",
                "phone": "0422-4324324",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "TN-CB-002"
            }
        ],
        "Madurai": [
            {
                "name": "Government Rajaji Hospital Blood Bank",
                "address": "Madurai - 625020",
                "phone": "0452-2530456",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "TN-MD-001"
            },
            {
                "name": "Meenakshi Mission Hospital Blood Bank",
                "address": "Lake Area, Melur Main Road, Madurai - 625107",
                "phone": "0452-2583333",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "TN-MD-002"
            }
        ],
        "Trichy": [
            {
                "name": "Government Mahatma Gandhi Memorial Hospital Blood Bank",
                "address": "Tiruchirappalli - 620008",
                "phone": "0431-2414844",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "TN-TR-001"
            }
        ],
        "Salem": [
            {
                "name": "Government Mohan Kumaramangalam Medical College Hospital Blood Bank",
                "address": "Salem - 636030",
                "phone": "0427-2449756",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "TN-SL-001"
            }
        ]
    },
    "Karnataka": {
        "Bangalore": [
            {
                "name": "Victoria Hospital Blood Bank",
                "address": "Fort, Bangalore - 560002",
                "phone": "080-26702446",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "KA-BG-001"
            },
            {
                "name": "Manipal Hospital Blood Bank",
                "address": "Old Airport Road, Bangalore - 560017",
                "phone": "080-25024444",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "KA-BG-002"
            },
            {
                "name": "Apollo Hospitals Blood Bank",
                "address": "Bannerghatta Road, Bangalore - 560076",
                "phone": "080-26304050",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "KA-BG-003"
            }
        ],
        "Mysore": [
            {
                "name": "K.R. Hospital Blood Bank",
                "address": "Sayyaji Rao Road, Mysore - 570001",
                "phone": "0821-2422571",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "KA-MY-001"
            }
        ]
    },
    "Kerala": {
        "Kochi": [
            {
                "name": "Medical Trust Hospital Blood Bank",
                "address": "MG Road, Kochi - 682016",
                "phone": "0484-2358001",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "type": "Private",
                "license": "KL-KC-001"
            },
            {
                "name": "Ernakulam General Hospital Blood Bank",
                "address": "Ernakulam - 682011",
                "phone": "0484-2369870",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "KL-KC-002"
            }
        ],
        "Thiruvananthapuram": [
            {
                "name": "Medical College Hospital Blood Bank",
                "address": "Thiruvananthapuram - 695011",
                "phone": "0471-2443152",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "KL-TV-001"
            }
        ],
        "Calicut": [
            {
                "name": "Government Medical College Hospital Blood Bank",
                "address": "Calicut - 673008",
                "phone": "0495-2359275",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "KL-CL-001"
            }
        ]
    },
    "Andhra Pradesh": {
        "Hyderabad": [
            {
                "name": "Gandhi Hospital Blood Bank",
                "address": "Secunderabad - 500003",
                "phone": "040-27501195",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "AP-HY-001"
            },
            {
                "name": "NIMS Hospital Blood Bank",
                "address": "Punjagutta, Hyderabad - 500082",
                "phone": "040-23489000",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets", "Cryoprecipitate"],
                "timings": "24x7",
                "license": "AP-HY-002"
            }
        ],
        "Visakhapatnam": [
            {
                "name": "King George Hospital Blood Bank",
                "address": "Visakhapatnam - 530002",
                "phone": "0891-2844770",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "AP-VS-001"
            }
        ]
    },
    "Maharashtra": {
        "Mumbai": [
            {
                "name": "KEM Hospital Blood Bank",
                "address": "Parel, Mumbai - 400012",
                "phone": "022-24129884",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "MH-MB-001"
            },
            {
                "name": "Tata Memorial Hospital Blood Bank",
                "address": "Parel, Mumbai - 400012",
                "phone": "022-24177000",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets", "Cryoprecipitate"],
                "timings": "24x7",
                "license": "MH-MB-002"
            }
        ],
        "Pune": [
            {
                "name": "Sassoon General Hospital Blood Bank",
                "address": "Pune - 411001",
                "phone": "020-26127777",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "MH-PN-001"
            }
        ]
    },
    "Delhi": {
        "New Delhi": [
            {
                "name": "AIIMS Blood Bank",
                "address": "Ansari Nagar, New Delhi - 110029",
                "phone": "011-26588500",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets", "Cryoprecipitate"],
                "timings": "24x7",
                "license": "DL-ND-001"
            },
            {
                "name": "Safdarjung Hospital Blood Bank",
                "address": "New Delhi - 110029",
                "phone": "011-26165060",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "24x7",
                "license": "DL-ND-002"
            },
            {
                "name": "Red Cross Blood Bank",
                "address": "Red Cross Road, New Delhi - 110001",
                "phone": "011-23711551",
                "components": ["Whole Blood", "Red Blood Cells", "Plasma", "Platelets"],
                "timings": "9 AM - 5 PM",
                "license": "DL-ND-003"
            }
        ]
    }
}

# Emergency contact numbers for blood banks
EMERGENCY_CONTACTS = {
    "National": {
        "National Blood Transfusion Council": "011-23061462",
        "Indian Red Cross Society": "011-23711551",
        "BloodConnect Foundation": "1910"
    },
    "Tamil Nadu": {
        "State Blood Transfusion Council": "044-28524810",
        "Chennai Blood Bank Helpline": "044-28524810"
    },
    "Karnataka": {
        "State Blood Bank": "080-22961443"
    },
    "Kerala": {
        "State Blood Bank": "0471-2552056"
    }
}