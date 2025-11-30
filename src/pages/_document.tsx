import { buildUrl } from "@/utils/buildUrl";
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="ja">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=M+PLUS+2&family=Montserrat&display=swap"
          rel="stylesheet"
        />
      </Head>
      <body style={{ background: "linear-gradient(180deg, #F0F1F2 0%, #E7EBEE 66.52%, #B1B7BB 71.46%, #CDDBE5 100%)", minHeight: "100vh" }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
