import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Building, ArrowLeft, Landmark, Phone, Hash } from "lucide-react";
import Cookies from "js-cookie";
import axios from "axios";
import { userProfile } from "../../apis/user.apis.js";

const UserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = Cookies.get("token");
      console.log("Token: ", token);

      const response = await axios.get(userProfile, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("User Profile Data:", response.data);

      setProfile(response.data.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to="/user/dashboard"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>

        <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-12">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile?.name}
                </h1>
                <p className="text-blue-100">Business Account</p>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Full Name
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-white text-lg">{profile?.name}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Email Address
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-white text-lg">{profile?.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Company Name
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Building className="w-5 h-5 text-gray-400" />
                <span className="text-white text-lg">
                  {profile?.businessDetails.companyName}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                GST No.
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Landmark className="w-5 h-5 text-gray-400" />
                <span className="text-white text-lg">
                  {profile?.businessDetails.gstNo}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Phone Number
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-white text-lg">
                  {profile?.businessDetails.phone}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Account Number
              </label>
              <div className="flex items-center space-x-3 p-4 bg-gray-700 rounded-lg">
                <Hash className="w-5 h-5 text-gray-400" />
                <span className="text-white text-lg">
                  {profile?.businessDetails.bankDetails.accountNumber}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Account Created
              </label>
              <div className="p-4 bg-gray-700 rounded-lg">
                <span className="text-white text-md">
                  {profile?.createdAt
                    ? new Date(profile.createdAt).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
