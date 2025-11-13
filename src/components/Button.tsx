// src/components/Button.tsx

// This is a React Component - a reusable UI piece
interface ButtonProps {
    text: string;           // What the button says
    onClick: () => void;    // What happens when clicked
    loading?: boolean;      // Optional: is it loading?
    variant?: 'primary' | 'secondary'; // Optional: style variant
  }
  
  export default function Button({ 
    text, 
    onClick, 
    loading = false,
    variant = 'primary'
  }: ButtonProps) {
    
    // This determines the button's style based on variant
    const styles = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
    };
    
    return (
      <button
        onClick={onClick}
        disabled={loading}
        className={`
          ${styles[variant]}
          px-6 py-3 rounded-lg font-semibold
          transition-colors duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        {loading ? 'Loading...' : text}
      </button>
    );
  }