import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Trash2, MapPin, Phone, Mail, Save, Eye, EyeOff } from "lucide-react";
import { optimizeProfileImage } from "../../../utils/imageUpload";

export default function UserSettingsPage({ userData, onAvatarUpdated, onProfileUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [address, setAddress] = useState(userData?.address || "");
  const [phoneNumber, setPhoneNumber] = useState(userData?.phoneNumber || "");
  const [showEmail, setShowEmail] = useState(userData?.showEmail !== false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setAddress(userData?.address || "");
    setPhoneNumber(userData?.phoneNumber || "");
    setShowEmail(userData?.showEmail !== false);
  }, [userData?.address, userData?.phoneNumber, userData?.showEmail]);

  const displayName = userData?.username || userData?.name || "User";
  const avatar =
    userData?.avatar ||
    userData?.picture ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f1720&color=67e8f9&size=256`;

  const persistAvatar = async (picture) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) throw new Error("You are not logged in.");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-picture`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ picture }),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data?.msg || "Failed to update profile picture");
    }

    if (typeof onAvatarUpdated === "function") {
      onAvatarUpdated(data?.picture || "");
    }

    return data?.picture || "";
  };

  const handleFileChange = async (event) => {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be 2MB or smaller.");
      event.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const pictureDataUrl = await optimizeProfileImage(file, { size: 512, quality: 0.82 });
      await persistAvatar(pictureDataUrl);
      setSuccess("Profile picture updated.");
    } catch (err) {
      setError(err?.message || "Unable to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemovePicture = async () => {
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      await persistAvatar("");
      setSuccess("Profile picture removed.");
    } catch (err) {
      setError(err?.message || "Unable to remove image.");
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) throw new Error("You are not logged in.");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/profile-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ address, phoneNumber, showEmail }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.msg || "Failed to update settings");
      }

      if (typeof onProfileUpdated === "function") {
        onProfileUpdated(data?.user || null);
      }

      setSuccess("Settings saved.");
    } catch (err) {
      setError(err?.message || "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="ml-auto flex-1 pr-8 py-8 pl-0 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="font-['Cinzel'] text-4xl mb-2 bg-gradient-to-r from-amber-100 via-amber-300 to-orange-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-stone-400">Manage your profile details</p>
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1b222a]/95 border border-stone-700 rounded-2xl p-6 max-w-3xl"
      >
        <h2 className="text-2xl font-['Cinzel'] text-stone-100 mb-4">Profile Picture</h2>

        <div className="flex flex-col md:flex-row gap-6 md:items-center mb-8">
          <div className="relative w-32 h-32 shrink-0">
            <img src={avatar} alt={displayName} className="w-32 h-32 rounded-full border-2 border-cyan-400/60 object-cover" />
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Camera className="w-4 h-4 text-cyan-200" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm text-stone-400">Upload JPG, PNG, GIF, or WEBP up to 2MB.</p>

            <div className="flex flex-wrap gap-3">
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploading ? "Uploading..." : "Upload New Picture"}
              </button>

              <button
                type="button"
                disabled={uploading}
                onClick={handleRemovePicture}
                className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Picture
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
              <MapPin className="w-4 h-4" /> Address
            </span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Street, city, country"
              className="w-full bg-[#0f141a] border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-cyan-400 focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500">
              <Phone className="w-4 h-4" /> Phone Number
            </span>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1 555 123 4567"
              className="w-full bg-[#0f141a] border border-stone-700 rounded-lg px-4 py-3 text-stone-100 placeholder-stone-500 focus:border-cyan-400 focus:outline-none"
            />
          </label>

          <div className="rounded-xl border border-stone-700 bg-[#0f141a] p-4 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-stone-100">
                <Mail className="w-4 h-4 text-cyan-300" /> Email visibility
              </div>
              <p className="text-xs text-stone-500 mt-1">Controls whether your email is shown on your profile.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowEmail((prev) => !prev)}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${showEmail ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-200" : "border-stone-600 bg-stone-800/70 text-stone-300"}`}
            >
              {showEmail ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              {showEmail ? "Shown" : "Hidden"}
            </button>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={saveSettings}
              disabled={saving}
              className="px-4 py-2 rounded-lg border border-cyan-400/40 bg-cyan-500/10 text-cyan-200 hover:bg-cyan-500/20 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Settings"}
            </button>
            <p className="text-xs text-stone-500">Password is intentionally not shown.</p>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}
          {success && <p className="text-sm text-emerald-300">{success}</p>}
        </div>
      </motion.section>
    </main>
  );
}