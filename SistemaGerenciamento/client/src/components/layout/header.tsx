import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useLocation } from "wouter";

interface HeaderProps {
  showBackButton?: boolean;
  onLogout: () => void;
}

export function Header({ showBackButton = false, onLogout }: HeaderProps) {
  const [, setLocation] = useLocation();

  return (
    <header className="bg-primary text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white text-primary px-3 py-1 rounded font-bold text-sm">PLANET</div>
            <div className="bg-secondary text-white px-3 py-1 rounded font-bold text-sm">JUKE</div>
            {showBackButton && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setLocation("/")}
                className="ml-4 bg-secondary hover:bg-hover"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={onLogout}
            className="bg-red-600 hover:bg-red-700"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </header>
  );
}
