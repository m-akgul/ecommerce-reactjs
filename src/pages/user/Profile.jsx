import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../api/axios";
import { toast } from "react-toastify";
import { safeAxios } from "../../api/axiosWrapper";
import { API_ENDPOINTS } from "../../utils/constants";
import EditProfileModal from "../../components/user/EditProfileModal";
import AddressModal from "../../components/user/AddressModal";
import ChangeEmailModal from "../../components/user/ChangeEmailModal";

function Profile() {
  const { token, user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);

  const [addressModal, setAddressModal] = useState({
    show: false,
    initial: null,
  });

  useEffect(() => {
    if (!token) return;
    safeAxios(
      () =>
        axios.get(API_ENDPOINTS.ADDRESSES, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Could not fetch addresses."
    ).then((res) => res?.success && setAddresses(res.data));
  }, [token]);

  const reloadAddresses = () => {
    safeAxios(
      () =>
        axios.get(API_ENDPOINTS.ADDRESSES, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Could not refresh addresses."
    ).then((res) => res?.success && setAddresses(res.data));
  };

  const handleDelete = async (id) => {
    const res = await safeAxios(
      () =>
        axios.delete(`${API_ENDPOINTS.ADDRESSES}/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      "Could not delete address."
    );
    if (res?.success) {
      toast.success("Address deleted!");
      reloadAddresses();
    }
  };

  if (!user) {
    return <div className="text-center mt-5">Loading profile...</div>;
  }

  return (
    <div className="container my-5">
      <h2 className="mb-4">My Profile</h2>

      {/* USER INFO */}
      <div className="card shadow-sm mb-4">
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start gap-3">
          <div>
            <p className="mb-2">
              <strong>Username:</strong> {user.name}
            </p>
            <p className="mb-2">
              <strong>Phone Number:</strong> {user.phone || "—"}
            </p>
            <p className="mb-0">
              <strong>Email:</strong> {user.email}
              <button
                className="btn btn-sm btn-outline-primary ms-2"
                onClick={() => setShowEmailModal(true)}
              >
                Change
              </button>
            </p>
          </div>
          <div>
            <button
              className="btn btn-outline-primary"
              onClick={() => setShowProfileModal(true)}
            >
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* MY ORDERS */}
      <div className="mb-4">
        <Link to="/orders" className="btn btn-primary">
          📦 View My Orders
        </Link>
      </div>

      {/* ADDRESSES */}
      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="mb-0">Shipping Addresses</h5>
          <button
            className="btn btn-sm btn-success"
            onClick={() => setAddressModal({ show: true, initial: null })}
          >
            + Add Address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-muted">No addresses added yet.</p>
        ) : (
          <div className="row g-3">
            {addresses.map((addr) => (
              <div key={addr.id} className="col-12 col-md-6">
                <div className="border rounded p-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <h6 className="fw-semibold mb-2">{addr.title}</h6>
                    <p className="mb-1 text-muted small">
                      {addr.fullAddress}, {addr.city}, {addr.postalCode}
                    </p>
                  </div>
                  <div className="mt-2 d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() =>
                        setAddressModal({ show: true, initial: addr })
                      }
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(addr.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      <EditProfileModal
        show={showProfileModal}
        initial={{ username: user.name, phone: user.phone || "" }}
        onClose={(saved) => {
          setShowProfileModal(false);
          if (saved) window.location.reload();
        }}
      />
      <ChangeEmailModal
        show={showEmailModal}
        onClose={() => setShowEmailModal(false)}
      />
      <AddressModal
        show={addressModal.show}
        initial={addressModal.initial}
        onClose={(saved) => {
          setAddressModal({ show: false, initial: null });
          if (saved) reloadAddresses();
        }}
      />
    </div>
  );
}

export default Profile;
