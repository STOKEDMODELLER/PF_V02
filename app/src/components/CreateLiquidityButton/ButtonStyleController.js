/**
 * ButtonStyleController manages button styles dynamically based on its state and progress.
 */
const ButtonStyleController = ({ status, cooldown, isProcessing }) => {
    let backgroundColor;
    let textColor = "text-white";
    let cursor = "cursor-not-allowed";
    let filter = "none";

    if (isProcessing) {
        backgroundColor = "bg-yellow-500";
    } else if (status === "success") {
        backgroundColor = "bg-green-500";
    } else if (status === "error") {
        backgroundColor = "bg-red-500";
    } else if (cooldown > 0) {
        const cooldownColors = ["bg-blue-600", "bg-blue-500", "bg-blue-400", "bg-blue-300", "bg-blue-200"];
        backgroundColor = cooldownColors[5 - cooldown] || "bg-blue-600";
        textColor = "text-gray-300";
        filter = "blur(1px)";
    } else {
        backgroundColor = "bg-blue-600 hover:brightness-110 hover:scale-105";
        cursor = "cursor-pointer";
    }

    return {
        backgroundColor,
        textColor,
        cursor,
        filter,
    };
};

export default ButtonStyleController;
