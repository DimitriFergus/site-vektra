# Gera o pacote do site oficial para subir na Hostinger (vektracontabil.com).
#
# Uso, na pasta SITE VEKTRA:
#     python publicar/gerar-pacote.py
#
# Cria "vektra-site.zip" na Área de Trabalho, só com o que o site oficial usa:
# as páginas, assets/css, assets/js e as imagens referenciadas, mais o .htaccess.
# Ficam de fora: ficticio/, teste/, base-de-conhecimento/, fotos originais e
# imagens que nenhuma página usa.
#
# Na Hostinger: Sites > vektracontabil.com > Arquivos > Gerenciador de arquivos >
# public_html > enviar o zip > botão direito > Extract, nome da pasta "." e marcar
# "Sobrescrever arquivos existentes" > depois mover o zip para fora da public_html.
import os, re, subprocess, zipfile

RAIZ = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.chdir(RAIZ)
SAIDA = os.path.join(os.path.expanduser("~"), "Desktop", "vektra-site.zip")

HTACCESS = open(os.path.join(RAIZ, "publicar", "htaccess.txt"), encoding="utf-8").read()

arquivos = subprocess.run(["git", "ls-files"], capture_output=True, text=True, encoding="utf-8").stdout.splitlines()
fora = ("ficticio/", "teste/", "base-de-conhecimento/", "_backup/", "publicar/")
paginas = [f for f in arquivos if f.endswith(".html") and "/" not in f]
codigo = [f for f in arquivos if f.startswith(("assets/css/", "assets/js/"))]

# imagens: só as que aparecem em alguma página, CSS ou JS
texto = "".join(open(f, encoding="utf-8").read() for f in paginas + codigo)
imagens = [f for f in arquivos if f.startswith("assets/img/") and os.path.basename(f) in texto]

incluir = sorted(set(paginas + codigo + imagens))
assert "index.html" in incluir
with zipfile.ZipFile(SAIDA, "w", zipfile.ZIP_DEFLATED) as z:
    for f in incluir:
        z.write(f, f)
    z.writestr(".htaccess", HTACCESS)

print(f"{len(incluir)} arquivos + .htaccess -> {SAIDA} ({os.path.getsize(SAIDA) // 1024} KB)")
