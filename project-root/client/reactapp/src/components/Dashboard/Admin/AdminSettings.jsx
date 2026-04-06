import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Camera, Upload, Trash2 } from "lucide-react";
import { optimizeProfileImage } from "../../../utils/imageUpload";

export default function AdminSettings({ userData, onAvatarUpdated }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef(null);

  const displayName = userData?.name || userData?.username || "Admin";
  const avatar =
    userData?.picture ||
    userData?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0f1720&color=67e8f9&size=256`;

  const savePicture = async (picture) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      throw new Error("You are not logged in.");
    }

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

    const updatedPicture = data?.picture || "";
    if (typeof onAvatarUpdated === "function") {
      onAvatarUpdated(updatedPicture);
    }
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
      await savePicture(pictureDataUrl);
      setSuccess("Profile picture updated.");
    } catch (err) {
      setError(err?.message || "Unable to upload image.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const handleRemove = async () => {
    setError("");
    setSuccess("");
    setUploading(true);
    try {
      await savePicture("");
      setSuccess("Profile picture removed.");
    } catch (err) {
      setError(err?.message || "Unable to remove image.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl mb-2 font-['Cinzel'] bg-gradient-to-r from-amber-200 via-amber-300 to-orange-500 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-stone-400">Manage your admin profile settings</p>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl bg-gradient-to-br from-[#1b222a]/95 to-[#131820]/80 border border-stone-700 rounded-2xl p-6"
      >
        <h2 className="text-2xl font-['Cinzel'] text-stone-100 mb-4">Profile Picture</h2>

        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          <div className="relative w-32 h-32">
            <img
              src={avatar}
              alt={displayName}
              className="w-32 h-32 rounded-full border-2 border-cyan-400/60 object-cover"
            />
            <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center">
              <Camera className="w-4 h-4 text-cyan-200" />
            </div>
          </div>

          <div className="flex-1 space-y-3">
            <p className="text-sm text-stone-400">Upload JPG, PNG, GIF, or WEBP up to 2MB.</p>

            <div className="flex flex-wrap gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
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
                onClick={handleRemove}
                className="px-4 py-2 rounded-lg border border-red-400/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors disabled:opacity-60 inline-flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Remove Picture
              </button>
            </div>

            {error && <p className="text-sm text-red-300">{error}</p>}
            {success && <p className="text-sm text-emerald-300">{success}</p>}
          </div>
        </div>
      </motion.section>
    </div>
  );
}
