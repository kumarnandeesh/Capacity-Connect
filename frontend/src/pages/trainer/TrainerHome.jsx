import { useEffect, useState } from "react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { PageHeader, NotificationFeed } from "../../components/UI";

export default function TrainerHome() {
  const { token, user } = useAuth();
  const [feed, setFeed] = useState([]);

  useEffect(() => {
    api.get("/home-feed", token).then(setFeed).catch(() => {});
  }, [token]);

  return (
    <>
      <PageHeader title={`Welcome back, ${user?.name?.split(" ")[0]}`} subtitle="Here's what's new across Capacity Connect." />
      <div className="panel">
        <h3 style={{ marginBottom: 14 }}>Announcements &amp; achievements</h3>
        <NotificationFeed items={feed} />
      </div>
    </>
  );
}
