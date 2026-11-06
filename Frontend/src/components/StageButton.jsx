import "../styles/StageButton.css";

const StageButton = ({ children, type = "button", onClick }) => {
    return (
        <button
            className="stagemate-button"
            type={type}
            onClick={onClick}
        >
            {children}
        </button>
    );
};

export default StageButton;