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

/** Like `renderRichText`, plus `- ` lines grouped into bullet lists (`listClassName` styles each list). */
export function renderRichBlocks(text: string, listClassName = "list-disc pl-6") {
  const bold = (line: string) =>
    line.split("**").map((part, j) =>
      j % 2 === 1 ? (
        <strong key={j} className="font-bold">
          {part}
        </strong>
      ) : (
        part
      ),
    );
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (!bullets.length) return;
    out.push(
      <ul key={`ul${out.length}`} className={listClassName}>
        {bullets.map((b) => (
          <li key={b}>{bold(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  text.split("\n").forEach((line, i) => {
    if (line.startsWith("- ")) {
      bullets.push(line.slice(2));
      return;
    }
    flush();
    out.push(
      <span key={i} className="block">
        {bold(line)}
      </span>,
    );
  });
  flush();
  return out;
}
