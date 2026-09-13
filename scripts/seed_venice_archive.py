import json
import re
import os

# We will load the user's 325 records
# Artist and Photographer heuristics based on the caption
ARTIST_PATTERNS = [
    (r"J\.?M\.?W\.?\s*Turner", "J.M.W. Turner"),
    (r"Claude Monet", "Claude Monet"),
    (r"Canaletto|Antonio Canal", "Giovanni Antonio Canal (Canaletto)"),
    (r"Francesco Guardi", "Francesco Guardi"),
    (r"John Singer Sargent", "John Singer Sargent"),
    (r"Ettore Tito", "Ettore Tito"),
    (r"Michele Mareschi", "Michele Mareschi"),
    (r"Andrew Fisher Bunner", "Andrew Fisher Bunner"),
    (r"Luca Carlevaris|Luca Carlevarijs", "Luca Carlevaris"),
    (r"Antonietta Brandeis", "Antonietta Brandeis"),
    (r"Samuel Prout", "Samuel Prout"),
    (r"Rudolf von Alt", "Rudolf von Alt"),
    (r"Maurice Prendergast", "Maurice Prendergast"),
    (r"William Logsdail", "William Logsdail"),
    (r"William Callow", "William Callow"),
    (r"William Wyld", "William Wyld"),
    (r"Antonio Joli", "Antonio Joli"),
    (r"Federico Del Campo|Federico del Campo", "Federico del Campo"),
    (r"Bernardo Bellotto", "Bernardo Bellotto"),
    (r"Ippolito Caffi", "Ippolito Caffi"),
    (r"Gabriele Bella", "Gabriele Bella"),
    (r"Luigi Querena", "Luigi Querena"),
    (r"Federico Moja", "Federico Moja"),
    (r"Konstantin Gorbatov", "Konstantin Gorbatov"),
    (r"Arthur Streeton", "Arthur Streeton"),
    (r"Henry Pether", "Henry Pether"),
    (r"Myles Birket Foster", "Myles Birket Foster"),
    (r"Louis Abel Truchet", "Louis Abel Truchet"),
    (r"William Stanley Haseltine", "William Stanley Haseltine"),
    (r"Otto Henry Bacher", "Otto Henry Bacher"),
    (r"Francis Sydney Unwin", "Francis Sydney Unwin"),
    (r"William James M[uü]ller", "William James Müller"),
    (r"Jules-Romain Joyant", "Jules-Romain Joyant"),
    (r"Mart[ií]n Rico y Ortega", "Martín Rico y Ortega"),
    (r"Albert Emil Kirchner", "Albert Emil Kirchner"),
    (r"Noe[̀e] Bordignon", "Noè Bordignon"),
    (r"Edward William Cooke", "Edward William Cooke"),
    (r"Joseph Chapuy", "Joseph Chapuy"),
    (r"Julius LeBlanc Stewart", "Julius LeBlanc Stewart"),
    (r"Luigi Maria Galea", "Luigi Maria Galea"),
    (r"V\.?L\.?\s*Vigano", "V.L. Vigano"),
    (r"Giuseppe Canella", "Giuseppe Canella"),
    (r"Thomas Ellison", "Thomas Ellison"),
    (r"Apollonio Facchinetti", "Apollonio Facchinetti"),
    (r"Friederich Nerly|Friedrich Christian Nerly", "Friedrich Christian Nerly"),
    (r"Maurice Bompard", "Maurice Bompard"),
    (r"Beryl De Selincourt", "Beryl De Selincourt"),
    (r"Affleck,?\s*Andrew\s*F\.?", "Andrew F. Affleck"),
    (r"James Charles", "James Charles"),
    (r"Al Thevenin", "Al Thevenin"),
    # Photographers
    (r"Fratelli Alinari", "Fratelli Alinari"),
    (r"C\.?\s*Naya|Carlo Naya", "Carlo Naya"),
    (r"Paolo Salviati|P\.?\s*Salviati", "Paolo Salviati"),
    (r"Tomaso Filippi|Tommaso Filippi", "Tommaso Filippi"),
    (r"Domenico Bresolin|G\.?\s*Brasolin", "Domenico Bresolin"),
    (r"Carlo Ponti|C\.?\s*Ponti", "Carlo Ponti"),
    (r"Ferdinando Ongania|F\.?\s*Ongania", "Ferdinando Ongania"),
    (r"Photochrom Z[uü]rich", "Photochrom Zürich"),
    (r"Giorgio Sommer|G\.?\s*Somer", "Giorgio Sommer"),
    (r"Bonaldi & Tarraghetta", "Bonaldi & Tarraghetta"),
    (r"Alfred Stieglitz|A\.?\s*Stieglitz", "Alfred Stieglitz"),
    (r"Auguste L[eé]on", "Auguste Léon"),
    (r"Luigia Alzetta", "Luigia Alzetta"),
    (r"Giovanni Battista Brusa|G\.?\s*Brocca", "Giovanni Battista Brusa"),
    (r"G\.?\s*Sciutto", "G. Sciutto"),
    (r"Ottoline Morrell", "Ottoline Morrell"),
    (r"Iddi Pietro", "Iddi Pietro"),
    (r"Possemiers", "Possemiers"),
]

def extract_creator(caption, current_creator, title):
    if current_creator and current_creator != "Unknown Artist":
        return current_creator
    for pattern, name in ARTIST_PATTERNS:
        if re.search(pattern, caption, re.IGNORECASE) or re.search(pattern, title, re.IGNORECASE):
            return name
    return "Unknown Historic Artist / Photographer"

def extract_year_and_era(caption, raw_year, title):
    combined = f"{title} {caption}"
    # Look for 4 digit year between 1500 and 1930
    match = re.search(r"\b(1[5-9]\d{2}|19[0-3]\d)\b", caption)
    if match:
        year_num = int(match.group(1))
        era = "18th Century" if year_num < 1800 else ("19th Century" if year_num < 1900 else "Early 20th Century")
        return year_num, str(year_num), era
    
    # Textual era checks
    if re.search(r"18th\s+Century|17\d{2}s", combined, re.IGNORECASE):
        return 1750, "18th Century", "18th Century"
    if re.search(r"Early\s+20th\s+Century|about\s+19[0-2]\d|1900s|1920s|around\s+1900", combined, re.IGNORECASE):
        return 1905, "Early 20th Century", "Early 20th Century"
    if re.search(r"Late\s+19th\s+Century|1880s|1890s|1870s", combined, re.IGNORECASE):
        return 1885, "Late 19th Century", "19th Century"
    if re.search(r"Mid\s+19th\s+Century|1850s|1860s", combined, re.IGNORECASE):
        return 1855, "Mid 19th Century", "19th Century"
    if re.search(r"19th\s+Century", combined, re.IGNORECASE):
        return 1875, "19th Century", "19th Century"
        
    if isinstance(raw_year, int) and 1500 <= raw_year <= 1935:
        era = "18th Century" if raw_year < 1800 else ("19th Century" if raw_year < 1900 else "Early 20th Century")
        return raw_year, str(raw_year), era
        
    return 1880, "Circa 19th Century", "19th Century"

def refine_sestiere(lat, lng, current_sestiere):
    if current_sestiere in ["San Marco", "San Polo", "Santa Croce", "Cannaregio", "Dorsoduro", "Castello"]:
        return current_sestiere
    # Disambiguate "Historic Venice" based on boundaries
    if lat >= 45.438 and lng >= 12.338:
        return "Castello" if lng >= 12.341 else "Cannaregio"
    if lat < 45.438 and lng >= 12.333:
        return "San Marco"
    if lat >= 45.435 and lng < 12.333:
        return "San Polo"
    if lat < 45.435 and lng < 12.333:
        return "Dorsoduro"
    return "San Marco"

print("Helper definitions loaded successfully.")
