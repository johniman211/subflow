'use client';

interface ContentWatermarkProps {
  customerPhone: string;
  creatorName: string;
}

export function ContentWatermark({ customerPhone, creatorName }: ContentWatermarkProps) {
  // Mask phone number for privacy (show first 4 and last 2 digits)
  const maskedPhone = customerPhone.length > 6 
    ? `${customerPhone.slice(0, 4)}****${customerPhone.slice(-2)}`
    : customerPhone;

  return (
    <>
      {/* Visible watermark overlay */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-40 opacity-30">
        <div className="bg-dark-900/80 backdrop-blur-sm px-4 py-2 rounded-lg border border-dark-700">
          <p className="text-xs text-dark-300">
            Paid via PaySSD · {maskedPhone}
          </p>
        </div>
      </div>

      {/* Diagonal repeating watermark for screenshots */}
      <div 
        className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.03] select-none"
        style={{
          backgroundImage: `repeating-linear-gradient(
            -45deg,
            transparent,
            transparent 100px,
            currentColor 100px,
            currentColor 101px
          )`,
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: 'rotate(-45deg) scale(2)',
          }}
        >
          <div className="whitespace-nowrap text-white text-lg font-bold tracking-widest">
            PaySSD · {maskedPhone} · PaySSD · {maskedPhone} · PaySSD · {maskedPhone}
          </div>
        </div>
      </div>

      {/* Disable right-click on content */}
      <style jsx global>{`
        .content-protected {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        .content-protected img {
          pointer-events: none;
        }
      `}</style>
    </>
  );
}
