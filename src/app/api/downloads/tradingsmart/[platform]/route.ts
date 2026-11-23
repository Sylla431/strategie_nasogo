import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REPO = "Sylla431/tradingsmart-releases";
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

// Les noms de fichiers contiennent la version (TradingSmart-0.1.6-win-x64.exe) :
// on retrouve le bon fichier dans la dernière release plutôt que de coder la version en dur.
const ASSET_PATTERNS: Record<string, RegExp> = {
  windows: /-win-x64\.exe$/,
  "mac-arm64": /-mac-arm64\.dmg$/,
  "mac-x64": /-mac-x64\.dmg$/,
};

type ReleaseAsset = { name: string; browser_download_url: string };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const pattern = ASSET_PATTERNS[platform];
  if (!pattern) {
    return NextResponse.json({ error: "Plateforme inconnue" }, { status: 404 });
  }

  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 600 },
    });
    if (res.ok) {
      const release = (await res.json()) as { assets?: ReleaseAsset[] };
      const asset = release.assets?.find((a) => pattern.test(a.name));
      if (asset) return NextResponse.redirect(asset.browser_download_url, 302);
    }
  } catch {
    // GitHub indisponible : on retombe sur la page des téléchargements.
  }

  return NextResponse.redirect(RELEASES_PAGE, 302);
}
