import { Wallpaper } from "./wallpaper";
import { DesktopPlaceholder } from "./desktop-placeholder";

export function Desktop() {
  return (
    <main className="relative h-full overflow-hidden bg-background text-foreground">
      <Wallpaper />
      <DesktopPlaceholder />
    </main>
  );
}
