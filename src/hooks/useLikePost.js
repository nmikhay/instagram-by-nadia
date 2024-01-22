import { useState } from "react";
import useAuthStore from "../store/authStore";
import useShowToast from "./useShowToast";
import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { firestore } from "../firebase/firebase";

const useLikePost = (post) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const authUser = useAuthStore((state) => state.user);
    const showToast = useShowToast();

    // Safely handle undefined post or likes
    const likesCount = post?.likes?.length || 0;
    const isUserLiked = post?.likes?.includes(authUser?.uid) || false;

    const [likes, setLikes] = useState(likesCount);
    const [isLiked, setIsLiked] = useState(isUserLiked);

    const handleLikePost = async () => {
        if (isUpdating || !post) return;
        if (!authUser) return showToast("Error", "You must be logged in to like a post", "error");

        setIsUpdating(true);

        try {
            const postRef = doc(firestore, "posts", post.id);
            const updatedLikes = isLiked ? arrayRemove(authUser.uid) : arrayUnion(authUser.uid);

            await updateDoc(postRef, { likes: updatedLikes });

            setIsLiked(!isLiked);
            setLikes(isLiked ? likes - 1 : likes + 1);
        } catch (error) {
            showToast("Error", error.message, "error");
        } finally {
            setIsUpdating(false);
        }
    };

    return { isLiked, likes, handleLikePost, isUpdating };
};

export default useLikePost;
