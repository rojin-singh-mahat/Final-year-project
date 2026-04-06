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
		return <div className="text-center py-16 text-stone-400">Loading users...</div>;
	}

	return (
		<main className="m-auto flex-1 pr-8 py-8 pl-0 relative z-10">
			<div className="mb-8">
				<h1 className="text-4xl mb-2 font-['Cinzel'] font-bold bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
					User Management
				</h1>
				<p className="text-stone-400">Basic user list for admin overview</p>
			</div>

			{users.length === 0 ? (
				<div className="text-center py-16">
					<Users className="w-16 h-16 text-stone-500 mx-auto mb-4" />
					<p className="text-stone-400">No users found</p>
				</div>
			) : (
				<div className="bg-[#1b222a]/95 border border-stone-700 rounded-2xl overflow-hidden">
					<div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-stone-700 text-xs uppercase tracking-wider text-stone-500">
						<div className="col-span-4">Name</div>
						<div className="col-span-3">Role</div>
						<div className="col-span-5">ID</div>
					</div>

					<div className="divide-y divide-stone-700">
						{users.map((user, index) => (
							<motion.div
								key={user.id}
								initial={{ opacity: 0, y: 6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: index * 0.02 }}
								className="grid grid-cols-12 gap-4 px-6 py-4 items-center"
							>
								<div className="col-span-4 text-stone-100">{user.name}</div>
								<div className="col-span-3">
									<span className={`px-2 py-1 rounded-full text-xs border ${
										user.role === "admin"
											? "text-cyan-300 bg-cyan-500/10 border-cyan-400/30"
											: "text-amber-300 bg-amber-500/10 border-amber-400/30"
									}`}>
										{user.role}
									</span>
								</div>
								<div className="col-span-5 text-stone-400 text-sm break-all">{user.id}</div>
							</motion.div>
						))}
					</div>
				</div>
			)}
		</main>
	);
}

