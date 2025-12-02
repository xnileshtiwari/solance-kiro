'use client';

export function BackgroundBlobs() {
    return (
        <>
            <div className="blob-bg">
                <div className="blob blob-1" />
                <div className="blob blob-2" />
                <div className="blob blob-3" />
            </div>

            <style jsx>{`
                .blob-bg {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    z-index: 0;
                    overflow: hidden;
                    pointer-events: none;
                }

                .blob {
                    position: absolute;
                    border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
                    filter: blur(60px);
                    opacity: 0.6;
                    animation: float 20s infinite alternate;
                }

                @keyframes float {
                    0% {
                        transform: translate(0, 0) rotate(0deg);
                    }
                    100% {
                        transform: translate(50px, 50px) rotate(10deg);
                    }
                }

                .blob-1 {
                    width: 500px;
                    height: 500px;
                    background: #FFE4D6;
                    top: -10%;
                    left: -10%;
                    animation-delay: 0s;
                }

                .blob-2 {
                    width: 400px;
                    height: 400px;
                    background: #E0F2E9;
                    bottom: -5%;
                    right: -5%;
                    animation-delay: -5s;
                }

                .blob-3 {
                    width: 300px;
                    height: 300px;
                    background: #FFF4D6;
                    top: 40%;
                    left: 40%;
                    opacity: 0.5;
                    animation-delay: -10s;
                }
            `}</style>
        </>
    );
}
