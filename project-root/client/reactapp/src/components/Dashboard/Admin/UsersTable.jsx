import { React, useEffect, useState } from "react";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function UsersTable() {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		async function fetchUsers() {
			setLoading(true);
			try {
				const token = localStorage.getItem("token") || sessionStorage.getItem("token");
				const res = await fetch(`${import.meta.env.VITE_API_URL}/api/user/admin/users`, {
					headers: token ? { Authorization: `Bearer ${token}` } : {},
				});
				const data = await res.json();
				if (res.ok) {
					setUsers(Array.isArray(data.users) ? data.users : []);
				} else {
					setUsers([]);
				}
			} catch (err) {
				console.error("Error fetching users:", err);
				setUsers([]);
			} finally {
				setLoading(false);
			}
		}

		fetchUsers();
	}, []);

	if (loading) {
		return <div className="text-center py-16 text-[#b3b3b3]">Loading users...</div>;
	}

	return (
		<main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
			<div className="mb-8">
				<h1 className="text-4xl mb-2 bg-gradient-to-r from-white via-[#1DB954] to-[#8b5cf6] bg-clip-text text-transparent">
					User Management
				</h1>
				<p className="text-[#b3b3b3]">Basic user list for admin overview</p>
			</div>

			{users.length === 0 ? (
				<div className="text-center py-16">
					<Users className="w-16 h-16 text-[#808080] mx-auto mb-4" />
					<p className="text-[#b3b3b3]">No users found</p>
				</div>
			) : (
				<div className="bg-[#1a1a1a] border border-[#282828] rounded-2xl overflow-hidden">
					<div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#282828] text-xs uppercase tracking-wider text-[#808080]">
						<div className="col-span-4">Name</div>
						<div className="col-span-3">Role</div>
						<div className="col-span-5">ID</div>
					</div>

					<div className="divide-y divide-[#282828]">
						{users.map((user, index) => (
							<motion.div
								key={user.id}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.02 }}
								className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
							>
								<div className="col-span-4 text-white">{user.name}</div>
								<div className="col-span-3">
									<span className={`px-2 py-1 rounded-full text-xs border ${
										user.role === "admin"
											? "text-[#8b5cf6] bg-[#8b5cf6]/10 border-[#8b5cf6]/30"
											: "text-[#1DB954] bg-[#1DB954]/10 border-[#1DB954]/30"
									}`}>
										{user.role}
									</span>
								</div>
								<div className="col-span-5 text-[#b3b3b3] text-sm break-all">{user.id}</div>
							</motion.div>
						))}
					</div>
				</div>
			)}
		</main>
	);
}

