import { AiOutlineCloseSquare } from "react-icons/ai";
import './Popup.css';
import polokMeme from "../../assets/polok.png";

interface PopupProps {
  setIsOpenPopup: (isOpen: boolean) => void;
}

const Popup: React.FC<PopupProps> = ({ setIsOpenPopup }) => {
  return (
    <div
      onClick={() => setIsOpenPopup(false)}
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60"
    >
      {/* Content */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative bg-slate-900 rounded-lg w-64 p-5 animate-dropTop"
      >
        <div className="border-b border-gray-900 pb-2 flex justify-between items-center">
          <div
            onClick={() => setIsOpenPopup(false)}
            className="cursor-pointer text-xl"
          >
            <AiOutlineCloseSquare />
          </div>
        </div>
        {/* Body */}
        <div className="py-4 flex justify-center">
        <img src={polokMeme} alt="Popup Image" className="w-full h-auto max-h-64 object-contain" />
        </div>
      </div>
    </div>
  );
};

export default Popup;