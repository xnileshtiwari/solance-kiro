'use client';

interface ModeToggleProps {
    mode: 'normal' | 'assist';
    onToggle: () => void;
}

export function ModeToggle({ mode, onToggle }: ModeToggleProps) {
    return (
        <div className="mt-6 flex justify-center">
            <div className="relative inline-flex items-center bg-stone-200 rounded-full p-1">
                {/* Sliding background */}
                <div 
                    className={`
                        absolute top-1 bottom-1 bg-white rounded-full shadow-sm
                        transition-all duration-300 ease-in-out
                        ${mode === 'normal' ? 'left-1' : 'left-[calc(50%)]'}
                    `}
                    style={{ width: 'calc(50% - 4px)' }}
                />
                
                {/* Buttons */}
                <button
                    onClick={() => mode !== 'normal' && onToggle()}
                    className="relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300"
                >
                    <svg 
                        className={`w-5 h-5 transition-colors duration-300 ${mode === 'normal' ? 'text-amber-500' : 'text-stone-400'}`} 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
                    </svg>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${mode === 'normal' ? 'text-stone-900' : 'text-stone-500'}`}>
                        Solo
                    </span>
                </button>
                
                <button
                    onClick={() => mode !== 'assist' && onToggle()}
                    className="relative z-10 flex items-center gap-2 px-6 py-2.5 rounded-full transition-all duration-300"
                >
                    <svg 
                        className={`w-5 h-5 transition-colors duration-300 ${mode === 'assist' ? 'text-emerald-500' : 'text-stone-400'}`} 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path d="M12 2l2.5 6.5L21 11l-6.5 2.5L12 20l-2.5-6.5L3 11l6.5-2.5L12 2z" />
                        <path d="M19 3l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
                    </svg>
                    <span className={`text-sm font-semibold transition-colors duration-300 ${mode === 'assist' ? 'text-stone-900' : 'text-stone-500'}`}>
                        Co-pilot
                    </span>
                </button>
            </div>
        </div>
    );
}
