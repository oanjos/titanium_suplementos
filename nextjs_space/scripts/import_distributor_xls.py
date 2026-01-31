import csv
import os
import re
from datetime import datetime

import pandas as pd


XLS_PATH = r"C:\Users\otavi\OneDrive\Trabalhos\Titanium Suplementos\titanium_suplementos\produtos_2026-01-29-13-53-23.xls"
OUT_CSV = r"C:\Users\otavi\OneDrive\Trabalhos\Titanium Suplementos\titanium_suplementos\distributor_products_import.csv"


COL_MAP = {
    "ID": "source_id",
    "Código": "code",
    "Descrição": "description",
    "Unidade": "unit",
    "NCM": "ncm",
    "Origem": "origin",
    "Preço": "price",
    "Valor IPI fixo": "ipi_fixed_value",
    "Observações": "observations",
    "Situação": "status",
    "Estoque": "stock",
    "Preço de custo": "cost_price",
    "Cód. no fornecedor": "supplier_code",
    "Fornecedor": "supplier",
    "Localização": "location",
    "Estoque máximo": "stock_max",
    "Estoque mínimo": "stock_min",
    "Peso líquido (Kg)": "weight_net_kg",
    "Peso bruto (Kg)": "weight_gross_kg",
    "GTIN/EAN": "gtin_ean",
    "GTIN/EAN da Embalagem": "gtin_ean_package",
    "Largura do produto": "product_width",
    "Altura do Produto": "product_height",
    "Profundidade do produto": "product_depth",
    "Data Validade": "expiry_date",
    "Descrição do Produto no Fornecedor": "supplier_product_description",
    "Descrição Complementar": "description_complement",
    "Itens p/ caixa": "items_per_box",
    "Produto Variação": "product_variation",
    "Tipo Produção": "production_type",
    "Classe de enquadramento do IPI": "ipi_class",
    "Código na Lista de Serviços": "service_list_code",
    "Tipo do item": "item_type",
    "Grupo de Tags/Tags": "tags",
    "Tributos": "taxes",
    "Código Pai": "parent_code",
    "Código Integração": "integration_code",
    "Grupo de produtos": "product_group",
    "Marca": "brand",
    "CEST": "cest",
    "Volumes": "volumes",
    "Descrição Curta": "short_description",
    "Cross-Docking": "cross_docking",
    "URL Imagens Externas": "external_images_url",
    "Link Externo": "external_link",
    "Meses Garantia no Fornecedor": "warranty_months_supplier",
    "Clonar dados do pai": "clone_parent_data",
    "Condição do Produto": "product_condition",
    "Frete Grátis": "free_shipping",
    "Número FCI": "fci_number",
    "Vídeo": "video",
    "Departamento": "department",
    "Unidade de Medida": "unit_measure",
    "Preço de Compra": "purchase_price",
    "Categoria do produto": "product_category",
    "Informações Adicionais": "additional_info",
}

NUMERIC_COLS = {
    "price",
    "ipi_fixed_value",
    "stock",
    "cost_price",
    "stock_max",
    "stock_min",
    "weight_net_kg",
    "weight_gross_kg",
    "product_width",
    "product_height",
    "product_depth",
    "items_per_box",
    "volumes",
    "warranty_months_supplier",
    "purchase_price",
}


def to_decimal(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, (int, float)):
        return value
    s = str(value).strip()
    if s == "":
        return None
    s = s.replace(".", "").replace(",", ".")
    try:
        return float(s)
    except ValueError:
        return None


def to_text(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    s = str(value).strip()
    return s if s != "" else None


def parse_date(value):
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return None
    if isinstance(value, datetime):
        return value
    s = str(value).strip()
    if s == "":
        return None
    dt = pd.to_datetime(s, errors="coerce", dayfirst=True)
    if pd.isna(dt):
        return None
    return dt.to_pydatetime()


def main():
    df = pd.read_excel(XLS_PATH)
    df = df.rename(columns=COL_MAP)
    df = df[[c for c in COL_MAP.values() if c in df.columns]]

    # Clean numeric columns
    for col in NUMERIC_COLS:
        if col in df.columns:
            df[col] = df[col].apply(to_decimal)

    # Clean text columns
    for col in df.columns:
        if col not in NUMERIC_COLS and col != "expiry_date":
            df[col] = df[col].apply(to_text)

    # Dates
    if "expiry_date" in df.columns:
        df["expiry_date"] = df["expiry_date"].apply(parse_date)

    # Ensure code is present
    df["code"] = df["code"].apply(to_text)
    before = len(df)
    df = df[df["code"].notna()]
    after = len(df)

    df.to_csv(OUT_CSV, index=False, quoting=csv.QUOTE_MINIMAL)
    print(f"Rows in file: {before}")
    print(f"Rows with code: {after}")
    print(f"CSV saved to: {OUT_CSV}")
    print("Next step: import CSV into titaniumdb.distributor_products")


if __name__ == "__main__":
    main()
