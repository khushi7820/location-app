import { useState } from "react";
import { useLocation } from "react-router-dom";

export default function AddressForm() {
    const location = useLocation();

    const selectedLocation =
        location.state?.location;

    const [addressType, setAddressType] =
        useState("Home");

    const [flatNo, setFlatNo] = useState("");
    const [building, setBuilding] =
        useState("");
    const [landmark, setLandmark] =
        useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] =
        useState("");
    const [mobile, setMobile] =
        useState("");

    // Save validation
    const handleSave = () => {
        // Mobile validation
        if (mobile.length !== 10) {
            alert(
                "Mobile number must be 10 digits"
            );
            return;
        }

        // Pincode validation
        if (pincode.length !== 6) {
            alert(
                "Pincode must be 6 digits"
            );
            return;
        }

        // City validation
        if (!/^[A-Za-z ]+$/.test(city)) {
            alert("Enter valid city");
            return;
        }

        alert("Address Saved Successfully");
    };

    return (
        <div
            style={{
                background: "#000",
                minHeight: "100vh",
                color: "white",
                padding: "20px",
                fontFamily: "Arial",
            }}
        >
            {/* Heading */}
            <h1
                style={{
                    marginBottom: "25px",
                }}
            >
                Add Address Details
            </h1>

            {/* Selected Location */}
            <div
                style={{
                    background: "#1c1c1c",
                    padding: "15px",
                    borderRadius: "14px",
                    marginBottom: "25px",
                }}
            >
                <div
                    style={{
                        fontSize: "17px",
                        fontWeight: "bold",
                    }}
                >
                    {selectedLocation?.name}
                </div>

                <div
                    style={{
                        color: "#999",
                        marginTop: "5px",
                        fontSize: "14px",
                    }}
                >
                    {selectedLocation?.address}
                </div>
            </div>

            {/* Address Type Buttons */}
            <div
                style={{
                    display: "flex",
                    gap: "10px",
                    marginBottom: "20px",
                }}
            >
                {["Home", "Work", "Other"].map(
                    (type) => (
                        <button
                            key={type}
                            onClick={() =>
                                setAddressType(type)
                            }
                            style={{
                                flex: 1,
                                padding: "14px",
                                borderRadius: "12px",
                                border: "none",
                                cursor: "pointer",
                                background:
                                    addressType === type
                                        ? "#a855f7"
                                        : "#1c1c1c",
                                color: "white",
                                fontSize: "15px",
                            }}
                        >
                            {type}
                        </button>
                    )
                )}
            </div>

            {/* HOME ONLY FIELDS */}
            {addressType === "Home" && (
                <>
                    <input
                        type="text"
                        placeholder="Flat / House No."
                        value={flatNo}
                        onChange={(e) =>
                            setFlatNo(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Building Name"
                        value={building}
                        onChange={(e) =>
                            setBuilding(e.target.value)
                        }
                        style={inputStyle}
                    />
                </>
            )}

            {/* COMMON FIELDS */}

            <input
                type="text"
                placeholder="Landmark"
                value={landmark}
                onChange={(e) =>
                    setLandmark(e.target.value)
                }
                style={inputStyle}
            />

            {/* CITY */}
            <input
                type="text"
                placeholder="City"
                value={city}
                onChange={(e) => {
                    const value = e.target.value;

                    // Only letters
                    if (/^[A-Za-z ]*$/.test(value)) {
                        setCity(value);
                    }
                }}
                style={inputStyle}
            />

            {/* PINCODE */}
            <input
                type="text"
                placeholder="Pincode"
                value={pincode}
                onChange={(e) => {
                    const value = e.target.value;

                    // Only numbers max 6
                    if (
                        /^[0-9]*$/.test(value) &&
                        value.length <= 6
                    ) {
                        setPincode(value);
                    }
                }}
                style={inputStyle}
            />

            {/* MOBILE */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    background: "#1c1c1c",
                    borderRadius: "14px",
                    padding: "15px",
                    marginBottom: "15px",
                }}
            >
                <div
                    style={{
                        color: "#999",
                        marginRight: "10px",
                    }}
                >
                    +91
                </div>

                <input
                    type="text"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => {
                        const value = e.target.value;

                        // Only numbers max 10
                        if (
                            /^[0-9]*$/.test(value) &&
                            value.length <= 10
                        ) {
                            setMobile(value);
                        }
                    }}
                    style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "white",
                        width: "100%",
                        fontSize: "15px",
                    }}
                />
            </div>

            {/* SAVE BUTTON */}
            <button
                onClick={handleSave}
                style={{
                    width: "100%",
                    marginTop: "25px",
                    padding: "16px",
                    border: "none",
                    borderRadius: "14px",
                    background: "#a855f7",
                    color: "white",
                    fontSize: "16px",
                    cursor: "pointer",
                }}
            >
                Save Address
            </button>
        </div>
    );
}

const inputStyle = {
    width: "100%",
    background: "#1c1c1c",
    border: "none",
    outline: "none",
    color: "white",
    padding: "15px",
    borderRadius: "14px",
    marginBottom: "15px",
    fontSize: "15px",
    boxSizing: "border-box",
};