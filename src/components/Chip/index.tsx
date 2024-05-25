interface Props {
  children: React.ReactNode;
  onClick?: () => void;
  onDelete?: () => void;
}

const Chip = ({ children, onClick, onDelete }: Props) => {
  return (
    <button
      tabIndex={0}
      className="flex h-8 items-center justify-center gap-1 rounded-full border border-zinc-300 transition-[background-color] hover:bg-zinc-200"
      onClick={onClick}
    >
      <span className=" px-3 text-[13px] text-zinc-800">{children}</span>
      {onDelete && (
        <svg
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="mr-2 h-5 w-5 fill-current text-lg text-[#00000042] hover:text-[#00000066]"
          focusable="false"
          aria-hidden="true"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"></path>
        </svg>
      )}
    </button>
  );
};

export default Chip;
