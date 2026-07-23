import React from "react";
import ReactMarkdown from "react-markdown";

interface EventDescriptionProps {
  description: string;
}

export function EventDescription({ description }: EventDescriptionProps) {
  // We use ReactMarkdown to support basic markdown tags like lists, links, bold, etc.

  // Custom renderer for paragraphs to detect YouTube links and render an iframe
  const renderParagraph = ({ children }: any) => {
    // Basic YouTube regex matching
    const ytRegex =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

    // Check if the children is just a string that contains a YouTube URL
    if (typeof children === "string") {
      const match = children.match(ytRegex);
      if (match && match[1]) {
        return (
          <div className="w-full aspect-video my-4 rounded-md overflow-hidden">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${match[1]}`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        );
      }
    }

    return <p>{children}</p>;
  };

  return (
    <div className="bg-card rounded-sm border border-[#c2c9d6] p-6 shadow-sm">
      <h2 className="text-xl font-bold text-foreground mb-4">Acerca de este evento</h2>
      <div className="prose prose-sm max-w-none dark:prose-invert text-[15px] leading-relaxed text-muted-foreground whitespace-pre-line">
        <ReactMarkdown
          components={{
            p: renderParagraph,
          }}
        >
          {description}
        </ReactMarkdown>
      </div>
    </div>
  );
}
