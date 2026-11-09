import { createRoot } from "react-dom/client";
import Aplicacao from "./Aplicacao.tsx";
import "./index.css";

const elementoRaiz = document.getElementById("root");
if (!elementoRaiz) throw new Error("Elemento raiz da aplicação não encontrado");
createRoot(elementoRaiz).render(<Aplicacao />);
