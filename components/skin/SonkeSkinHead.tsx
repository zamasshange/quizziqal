import { getPbsStylesheetHrefs } from "@/lib/pbs-shell";

/** PBS stylesheet links — proxied via middleware */
export default function SonkeSkinHead() {
  const stylesheets = getPbsStylesheetHrefs();

  return (
    <>
      {stylesheets.map((href) => (
        <link key={href} rel="stylesheet" href={href} precedence="high" />
      ))}
      <link rel="icon" href="/sonke-favicon.svg" type="image/svg+xml" />
    </>
  );
}
