/** Copy markup used in service-page text: `**bold**` spans and `\n` line breaks (no blank line between). */
export function renderRichText(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i} className="block">
      {line.split("**").map((part, j) =>
        j % 2 === 1 ? (
          <strong key={j} className="font-bold">
            {part}
          </strong>
        ) : (
          part
        ),
      )}
    </span>
  ));
}
