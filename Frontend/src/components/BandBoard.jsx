import { useEffect, useState } from "react";
import BandPostForm from "./BandPostForm.jsx";
import BandPostCard from "./BandPostCard.jsx";
import "../styles/BandBoard.css";

const API_URL = "http://localhost:9097";

const BandBoard = ({ bandId, currentUserId, ownerId }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const handleDeletePost = async (postId) => {
        const token = sessionStorage.getItem("token");

        if (!token) {
            throw new Error("Sessione scaduta. Effettua nuovamente il login.");
        }

        const response = await fetch(
            `${API_URL}/bands/${bandId}/posts/${postId}`,
            {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            throw new Error(
                data.message || "Impossibile eliminare il post"
            );
        }

        setPosts((previousPosts) =>
            previousPosts.filter((post) => post._id !== postId)
        );
    };

const handleUpdatePost = async (postId, updatedFields) => {
    const token = sessionStorage.getItem("token");

    if (!token) {
        throw new Error("Sessione scaduta. Effettua nuovamente il login.");
    }

    const response = await fetch(
        `${API_URL}/bands/${bandId}/posts/${postId}`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(updatedFields)
        }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(
            data.message || "Impossibile modificare il post"
        );
    }

    setPosts((previousPosts) =>
        previousPosts.map((post) =>
            post._id === postId ? data.post : post
        )
    );

    return data.post;
};



    useEffect(() => {
        const controller = new AbortController();

        const fetchPosts = async () => {
            setLoading(true);
            setError("");

            try {
                const token = sessionStorage.getItem("token");
                const response = await fetch(
                    `${API_URL}/bands/${bandId}/posts`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                if (!response.ok) {
                    throw new Error("Impossibile recuperare i post della band");
                }

                const data = await response.json();

                if (!controller.signal.aborted) {
                    setPosts(data.posts);
                }
            } catch (err) {
                if (err.name !== "AbortError" && !controller.signal.aborted) {
                    setError(err.message);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        };

        fetchPosts();
        return () => controller.abort();
    }, [bandId]);

    if (loading) return <p>Caricamento bacheca...</p>;
    if (error) return <p role="alert">{error}</p>;

    return (
        <div className="band-board">
            <BandPostForm
                bandId={bandId}
                onPostCreated={(newPost) => {
                    setPosts((previousPosts) => [newPost, ...previousPosts]);
                }}
            />

            {posts.length === 0 ? (
                <p>Ancora nessun post. Pubblica il primo aggiornamento!</p>
            ) : (
                posts.map((post) => (
                    <BandPostCard
                        key={post._id}
                        post={post}
                        bandId={bandId}
                        currentUserId={currentUserId}
                        ownerId={ownerId}
                        onDelete={handleDeletePost}
                        onUpdate={handleUpdatePost}
                    />
                ))
            )}
        </div>
    );
};

export default BandBoard;
