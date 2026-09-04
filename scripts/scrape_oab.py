#!/usr/bin/env python3
"""
Extrai questões e gabaritos do site Prova da Ordem (data-correct="true")
e consolida com o 43º Exame já extraído do markdown local.
"""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT = ROOT / "banco_oab.json"
MARKDOWN_43 = ROOT / "questoes_oab_43_gabarito.md"

# Distribuição padrão OAB 1ª fase (80 questões)
OAB_MATERIAS_80 = [
    (8, "Ética Profissional"),
    (2, "Filosofia"),
    (10, "Direito Constitucional"),
    (8, "Direito Administrativo"),
    (6, "Direito Tributário"),
    (4, "Direito Internacional"),
    (4, "Direito Financeiro e ECA"),
    (6, "Direito Civil"),
    (6, "Processo Civil"),
    (8, "Direito Penal"),
    (6, "Processo Penal"),
    (4, "Direito Empresarial"),
    (4, "Direito do Trabalho"),
    (4, "Processo do Trabalho"),
]

EXAMS = [
    {
        "slug": "39",
        "exame": "39º Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/39o-exame-oab-2023-3/",
        "skip_scrape": True,
        "note": "Prova ainda em cadastramento no site",
    },
    {
        "slug": "34",
        "exame": "XXXIV Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/xxxiv-exame-oab-2022-1/",
    },
    {
        "slug": "35",
        "exame": "XXXV Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/xxxv-exame-oab-2022-2/",
    },
    {
        "slug": "36",
        "exame": "36º Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/36-exame-oab-2022-3/",
    },
    {
        "slug": "32",
        "exame": "XXXII Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/xxxii-exame-oab-2021-1/",
    },
    {
        "slug": "33",
        "exame": "XXXIII Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/xxxiii-exame-oab-2021-2/",
    },
    {
        "slug": "31",
        "exame": "XXXI Exame",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/xxxi-exame-oab-2020-1/",
    },
    {
        "slug": "2010",
        "exame": "OAB 2010.3",
        "url": "https://www.provadaordem.com.br/banco-de-provas-1a-fase/oab-br-2010-3/",
    },
]


def materia_por_numero(numero: int, total: int = 80) -> str:
    if total != 80:
        # Provas antigas com formato diferente: inferência por blocos proporcionais
        ratio = numero / total
        acumulado = 0
        for qtd, nome in OAB_MATERIAS_80:
            acumulado += qtd / 80
            if ratio <= acumulado:
                return nome
        return OAB_MATERIAS_80[-1][1]

    acumulado = 0
    for qtd, nome in OAB_MATERIAS_80:
        acumulado += qtd
        if numero <= acumulado:
            return nome
    return OAB_MATERIAS_80[-1][1]


def limpar_alternativa(texto: str) -> str:
    texto = re.sub(r"^[A-D]\s*\n?", "", texto.strip())
    return re.sub(r"\s+", " ", texto).strip()


def parse_markdown_43() -> list[dict]:
    if not MARKDOWN_43.exists():
        print(f"Aviso: {MARKDOWN_43} não encontrado")
        return []

    content = MARKDOWN_43.read_text(encoding="utf-8")
    blocos = re.split(r"## Questão (\d+)/80\s*\n", content)[1:]
    questoes = []

    for i in range(0, len(blocos), 2):
        num = int(blocos[i])
        corpo = blocos[i + 1]
        gab_match = re.search(r"> Gabarito: \*\*([A-D])\*\*", corpo)
        if not gab_match:
            continue
        resposta = gab_match.group(1)

        partes = corpo.split("> Gabarito:")[0].strip()
        linhas = partes.split("\n")
        enunciado_linhas = []
        alternativas: dict[str, str] = {}

        for linha in linhas:
            alt_match = re.match(r"- \*\*([A-D])\)\*\* (.+?)(?:\s*\*\*\(CORRETA\)\*\*)?$", linha.strip())
            if alt_match:
                letra = alt_match.group(1)
                texto = alt_match.group(2).strip()
                alternativas[letra] = texto
            elif not linha.startswith("- **") and linha.strip():
                enunciado_linhas.append(linha.strip())

        enunciado = " ".join(enunciado_linhas)
        enunciado = re.sub(r"\s+", " ", enunciado).strip()

        questoes.append(
            {
                "id": f"43_q{num}",
                "exame": "43º Exame",
                "materia": materia_por_numero(num),
                "numero": num,
                "enunciado": enunciado,
                "alternativas": alternativas,
                "resposta_correta": resposta,
            }
        )

    return questoes


def scrape_exam(page, exam: dict) -> list[dict]:
    url = exam["url"]
    slug = exam["slug"]
    exame_nome = exam["exame"]

    print(f"  Scraping {exame_nome}...")
    page.goto(url, wait_until="networkidle", timeout=90000)
    time.sleep(2)

    cadastrando = page.locator("text=cadastrad").count() > 0
    if cadastrando:
        print(f"  ⚠ {exame_nome}: prova em cadastramento, pulando")
        return []

    raw = page.evaluate(
        """() => {
        const questions = document.querySelectorAll('li.question');
        return [...questions].map((q, idx) => {
            const content = q.querySelector('.question__content');
            const choices = q.querySelectorAll('.choice');
            const alts = {};
            let correct = null;
            choices.forEach((c, i) => {
                const letter = String.fromCharCode(65 + i);
                const textEl = c.querySelector('.choice__text');
                let text = textEl ? textEl.innerText.trim() : c.innerText.trim();
                text = text.replace(/^[A-D]\\s*\\n?/, '').trim();
                alts[letter] = text;
                if (c.getAttribute('data-correct') === 'true') correct = letter;
            });
            return {
                numero: idx + 1,
                enunciado: content ? content.innerText.trim() : '',
                alternativas: alts,
                resposta_correta: correct,
            };
        });
    }"""
    )

    total = len(raw)
    if total == 0:
        print(f"  ⚠ {exame_nome}: nenhuma questão encontrada")
        return []

    questoes = []
    for item in raw:
        num = item["numero"]
        if not item["resposta_correta"]:
            print(f"  ⚠ {exame_nome} Q{num}: gabarito não encontrado")
            continue
        questoes.append(
            {
                "id": f"{slug}_q{num}",
                "exame": exame_nome,
                "materia": materia_por_numero(num, total),
                "numero": num,
                "enunciado": item["enunciado"],
                "alternativas": item["alternativas"],
                "resposta_correta": item["resposta_correta"],
            }
        )

    print(f"  ✓ {exame_nome}: {len(questoes)} questões")
    return questoes


def main() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("Instale: pip install playwright && playwright install chromium")
        sys.exit(1)

    all_questions: list[dict] = []

    print("Parseando 43º Exame do markdown local...")
    q43 = parse_markdown_43()
    all_questions.extend(q43)
    print(f"  ✓ 43º Exame: {len(q43)} questões")

    scrape_targets = [e for e in EXAMS if not e.get("skip_scrape")]

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_extra_http_headers(
            {"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"}
        )

        for exam in scrape_targets:
            try:
                all_questions.extend(scrape_exam(page, exam))
            except Exception as exc:
                print(f"  ✗ Erro em {exam['exame']}: {exc}")

        browser.close()

    meta = {
        "total_questoes": len(all_questions),
        "examenes": sorted({q["exame"] for q in all_questions}),
        "materias": sorted({q["materia"] for q in all_questions}),
        "gerado_em": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "notas": [
            "39º Exame indisponível no site (em cadastramento)",
            "43º Exame extraído do markdown local",
        ],
    }

    output = {"meta": meta, "questoes": all_questions}
    OUTPUT.write_text(json.dumps(output, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"\n✅ Salvo: {OUTPUT} ({len(all_questions)} questões)")


if __name__ == "__main__":
    main()
