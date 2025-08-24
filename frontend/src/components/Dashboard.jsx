import React, { useState, useEffect } from 'react';
import { 
  User, Heart, MessageCircle, Phone, Mail, Calendar, MapPin, 
  Droplet, Shield, LogOut, Menu, X, Bell, Settings, Search,
  Users, Activity, AlertTriangle, Clock, Award, Plus, Filter
} from 'lucide-react';
import { useAuth } from './AuthContext';
import ChatbotModal from './ChatbotModal';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [showChatbot, setShowChatbot] = useState(false);
  const [currentTab, setCurrentTab] = useState('overview');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);

  // Initialize data on component mount
  useEffect(() => {
    initializeData();
  }, [user]);

  const initializeData = () => {
    // Mock data - replace with actual API calls
    setNotifications([
      { id: 1, type: 'urgent', message: 'Emergency blood request nearby', time: '5 min ago' },
      { id: 2, type: 'info', message: 'Your next donation eligibility is in 2 weeks', time: '1 hour ago' },
      { id: 3, type: 'success', message: 'Thank you for your last donation!', time: '2 days ago' }
    ]);

    setRecentActivity([
      { id: 1, type: 'donation', description: 'Blood donation completed', date: '2024-08-20', location: 'City Hospital' },
      { id: 2, type: 'match', description: 'Matched with patient', date: '2024-08-18', location: 'Hyderabad' },
      { id: 3, type: 'registration', description: 'Profile updated', date: '2024-08-15', location: 'Online' }
    ]);

    setEmergencyRequests([
      { id: 1, bloodGroup: 'O+', urgency: 'Critical', location: 'KIMS Hospital, Hyderabad', time: '30 min ago', units: 3 },
      { id: 2, bloodGroup: 'A-', urgency: 'Urgent', location: 'Apollo Hospital, Secunderabad', time: '1 hour ago', units: 2 }
    ]);

    setNearbyUsers([
      { id: 1, name: 'Rahul M.', bloodGroup: 'O+', distance: '2 km', lastSeen: '2 hours ago', type: 'donor' },
      { id: 2, name: 'Priya S.', bloodGroup: 'A+', distance: '5 km', lastSeen: '1 day ago', type: 'patient' },
      { id: 3, name: 'Kumar R.', bloodGroup: 'B+', distance: '8 km', lastSeen: '3 hours ago', type: 'donor' }
    ]);
  };

  const StatCard = ({ title, value, icon: Icon, bgColor, iconColor, textColor, trend, onClick }) => (
    <div 
      className={`${bgColor} rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${onClick ? 'hover:scale-105' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className={`w-12 h-12 ${iconColor} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${textColor}`} />
          </div>
          <div className="ml-4">
            <p className={`${textColor} text-sm font-medium`}>{title}</p>
            <p className={`text-2xl font-bold ${textColor.replace('600', '900')}`}>{value}</p>
            {trend && (
              <p className={`text-xs mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive 
          ? 'bg-red-600 text-white' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      <Icon className="w-4 h-4 mr-2" />
      {label}
    </button>
  );

  const NotificationBadge = ({ count }) => (
    count > 0 && (
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {count > 99 ? '99+' : count}
      </span>
    )
  );

  const EmergencyCard = ({ request }) => (
    <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
            <span className="font-semibold text-red-900">Blood Group: {request.bloodGroup}</span>
            <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
              request.urgency === 'Critical' 
                ? 'bg-red-200 text-red-800' 
                : 'bg-orange-200 text-orange-800'
            }`}>
              {request.urgency}
            </span>
          </div>
          <p className="text-gray-700 text-sm mb-1">{request.location}</p>
          <p className="text-gray-600 text-xs">Units needed: {request.units} • {request.time}</p>
        </div>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm">
          Respond
        </button>
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const getActivityIcon = (type) => {
      switch(type) {
        case 'donation': return <Droplet className="w-4 h-4" />;
        case 'match': return <Users className="w-4 h-4" />;
        case 'registration': return <User className="w-4 h-4" />;
        default: return <Activity className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex items-center p-3 bg-gray-50 rounded-lg mb-3">
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 mr-3">
          {getActivityIcon(activity.type)}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
          <p className="text-xs text-gray-500">{activity.date} • {activity.location}</p>
        </div>
      </div>
    );
  };

  const UserCard = ({ userData }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
          {userData.type === 'donor' ? (
            <Droplet className="w-5 h-5 text-red-600" />
          ) : (
            <User className="w-5 h-5 text-red-600" />
          )}
        </div>
        <div>
          <p className="font-medium text-gray-900">{userData.name}</p>
          <p className="text-sm text-gray-600">{userData.bloodGroup} • {userData.distance}</p>
          <p className="text-xs text-gray-500">Active {userData.lastSeen}</p>
        </div>
      </div>
      <button className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-colors text-sm">
        Contact
      </button>
    </div>
  );

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user?.userType === 'donor' ? (
          <>
            <StatCard
              title="Total Donations"
              value={user?.totalDonations || 0}
              icon={Heart}
              bgColor="bg-green-50"
              iconColor="bg-green-100"
              textColor="text-green-600"
              trend={5}
              onClick={() => setCurrentTab('donations')}
            />
            <StatCard
              title="Lives Saved"
              value={(user?.totalDonations || 0) * 3}
              icon={Users}
              bgColor="bg-blue-50"
              iconColor="bg-blue-100"
              textColor="text-blue-600"
              trend={12}
            />
            <StatCard
              title="Next Eligible"
              value={user?.nextEligible ? new Date(user.nextEligible).toLocaleDateString() : 'Available'}
              icon={Calendar}
              bgColor="bg-purple-50"
              iconColor="bg-purple-100"
              textColor="text-purple-600"
            />
            <StatCard
              title="Badges Earned"
              value={user?.badges?.length || 0}
              icon={Award}
              bgColor="bg-orange-50"
              iconColor="bg-orange-100"
              textColor="text-orange-600"
              onClick={() => setCurrentTab('achievements')}
            />
          </>
        ) : (
          <>
            <StatCard
              title="Last Transfusion"
              value={user?.lastTransfusion ? new Date(user.lastTransfusion).toLocaleDateString() : 'N/A'}
              icon={Heart}
              bgColor="bg-red-50"
              iconColor="bg-red-100"
              textColor="text-red-600"
            />
            <StatCard
              title="Next Required"
              value={user?.nextRequired ? new Date(user.nextRequired).toLocaleDateString() : 'TBD'}
              icon={Calendar}
              bgColor="bg-yellow-50"
              iconColor="bg-yellow-100"
              textColor="text-yellow-600"
            />
            <StatCard
              title="Urgency Level"
              value={user?.urgencyLevel || 'Low'}
              icon={AlertTriangle}
              bgColor="bg-orange-50"
              iconColor="bg-orange-100"
              textColor="text-orange-600"
            />
            <StatCard
              title="Compatible Donors"
              value="47"
              icon={Users}
              bgColor="bg-green-50"
              iconColor="bg-green-100"
              textColor="text-green-600"
              onClick={() => setCurrentTab('donors')}
            />
          </>
        )}
      </div>

      {/* Emergency Requests - Only show if user is donor */}
      {user?.userType === 'donor' && emergencyRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Emergency Blood Requests
            </h3>
            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
              View All
            </button>
          </div>
          {emergencyRequests.map(request => (
            <EmergencyCard key={request.id} request={request} />
          ))}
        </div>
      )}

      {/* Recent Activity and Nearby Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.map(activity => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
          <button className="w-full text-red-600 hover:text-red-700 text-sm font-medium mt-2">
            View All Activity
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Nearby {user?.userType === 'donor' ? 'Patients' : 'Donors'}
            </h3>
            <button className="text-red-600 hover:text-red-700">
              <Filter className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {nearbyUsers.map(userData => (
              <UserCard key={userData.id} userData={userData} />
            ))}
          </div>
          <button className="w-full text-red-600 hover:text-red-700 text-sm font-medium mt-4">
            Find More Users
          </button>
        </div>
      </div>
    </div>
  );

  const renderDonationsTab = () => (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-900">Donation History</h3>
        <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Donation
        </button>
      </div>
      
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((donation, index) => (
          <div key={donation} className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <Droplet className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="font-medium">Donation #{user?.totalDonations - index}</p>
                <p className="text-sm text-gray-600">City Hospital, Hyderabad</p>
                <p className="text-xs text-gray-500">
                  {new Date(Date.now() - (index * 90 * 24 * 60 * 60 * 1000)).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                Completed
              </span>
              <p className="text-xs text-gray-500 mt-1">450ml</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderProfileTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {user?.userType === 'donor' ? (
              <Droplet className="w-10 h-10 text-red-600" />
            ) : (
              <User className="w-10 h-10 text-red-600" />
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">{user?.name}</h2>
          <p className="text-gray-600 capitalize mb-2">{user?.userType}</p>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
            Active
          </span>
          
          <div className="mt-6 space-y-3">
            <div className="flex items-center justify-center text-gray-600">
              <Droplet className="w-4 h-4 mr-2" />
              Blood Group: {user?.bloodGroup}
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {user?.location}
            </div>
            <div className="flex items-center justify-center text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              Joined {new Date(user?.joinDate).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
            <button className="text-red-600 hover:text-red-700 flex items-center">
              <Settings className="w-4 h-4 mr-1" />
              Edit
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{user?.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{user?.phone}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                <p className="text-gray-900">{user?.bloodGroup}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{user?.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Date of Birth</label>
                <p className="text-gray-900">{user?.dateOfBirth || 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">User Type</label>
                <p className="text-gray-900 capitalize">{user?.userType}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Medical/Donor Specific Information */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            {user?.userType === 'donor' ? 'Donation Information' : 'Medical Information'}
          </h3>
          
          {user?.userType === 'donor' ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Total Donations</label>
                <p className="text-2xl font-bold text-green-600">{user?.totalDonations || 0}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Next Eligible</label>
                <p className="text-gray-900">{user?.nextEligible || 'Available'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Weight</label>
                <p className="text-gray-900">{user?.weight ? `${user.weight} kg` : 'Not provided'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500">Last Donation</label>
                <p className="text-gray-900">{user?.lastDonation || 'No donations yet'}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500">Medical History</label>
                <p className="text-gray-900">{user?.medicalHistory || 'Not provided'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Last Transfusion</label>
                  <p className="text-gray-900">{user?.lastTransfusion || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Urgency Level</label>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    user?.urgencyLevel === 'High' ? 'bg-red-100 text-red-800' :
                    user?.urgencyLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {user?.urgencyLevel || 'Low'}
                  </span>
                </div>
              </div>
              {user?.emergencyContact && (
                <div>
                  <label className="block text-sm font-medium text-gray-500">Emergency Contact</label>
                  <p className="text-gray-900">{user.emergencyContact}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="w-8 h-8 text-red-600 mr-3" />
              <span className="text-xl font-bold text-gray-900">ThalAssist</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="hidden md:block relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-gray-600 hover:text-gray-900 relative"
                >
                  <Bell className="w-5 h-5" />
                  <NotificationBadge count={notifications.filter(n => n.type === 'urgent').length} />
                </button>
                
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
                    <div className="p-4 border-b">
                      <h3 className="font-medium text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notification => (
                        <div key={notification.id} className="p-4 border-b hover:bg-gray-50">
                          <div className="flex items-start">
                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                              notification.type === 'urgent' ? 'bg-red-500' :
                              notification.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            }`} />
                            <div className="flex-1">
                              <p className="text-sm text-gray-900">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 border-t">
                      <button className="text-red-600 hover:text-red-700 text-sm font-medium w-full text-center">
                        Mark all as read
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-700">Welcome, {user?.name}</span>
                <button
                  onClick={logout}
                  className="flex items-center px-3 py-2 text-gray-700 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 py-4">
            <TabButton 
              id="overview" 
              label="Overview" 
              icon={Activity} 
              isActive={currentTab === 'overview'} 
              onClick={setCurrentTab} 
            />
            <TabButton 
              id="profile" 
              label="Profile" 
              icon={User} 
              isActive={currentTab === 'profile'} 
              onClick={setCurrentTab} 
            />
            {user?.userType === 'donor' && (
              <TabButton 
                id="donations" 
                label="Donations" 
                icon={Droplet} 
                isActive={currentTab === 'donations'} 
                onClick={setCurrentTab} 
              />
            )}
            {user?.userType === 'donor' && (
              <TabButton 
                id="achievements" 
                label="Achievements" 
                icon={Award} 
                isActive={currentTab === 'achievements'} 
                onClick={setCurrentTab} 
              />
            )}
            {user?.userType === 'patient' && (
              <TabButton 
                id="donors" 
                label="Find Donors" 
                icon={Users} 
                isActive={currentTab === 'donors'} 
                onClick={setCurrentTab} 
              />
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'overview' && renderOverviewTab()}
        {currentTab === 'profile' && renderProfileTab()}
        {currentTab === 'donations' && renderDonationsTab()}
        {currentTab === 'achievements' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Your Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user?.badges?.map((badge, index) => (
                <div key={index} className="bg-gradient-to-r from-red-50 to-red-100 rounded-lg p-6 text-center">
                  <Award className="w-12 h-12 text-red-600 mx-auto mb-4" />
                  <h4 className="font-bold text-gray-900 mb-2">{badge}</h4>
                  <p className="text-sm text-gray-600">Earned for dedication to blood donation</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {currentTab === 'donors' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Compatible Donors Near You</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {nearbyUsers.filter(u => u.type === 'donor').map(donor => (
                <UserCard key={donor.id} userData={donor} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 space-y-4">
        {/* Emergency Button - Only for patients */}
        {user?.userType === 'patient' && (
          <button className="w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors animate-pulse">
            <AlertTriangle className="w-6 h-6" />
          </button>
        )}
        
        {/* Chatbot Button */}
        <button
          onClick={() => setShowChatbot(true)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
      </div>

      {/* Chatbot Modal */}
      {showChatbot && (
        <ChatbotModal user={user} onClose={() => setShowChatbot(false)} />
      )}

      {/* Click outside to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;