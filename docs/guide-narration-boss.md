# Guide Enrichissement Narration Boss

**Document:** Pattern pour écrire des dialogues boss mémorables et contextualisés.

---

## Principes narratifs

### 1. Contexte spatial

Le boss est lié à son biome/chapitre. Les dialogues doivent refléter l'environnement.

- **Brasier (Ch.1)** → chaos primaire, chaleur incontrôlable, manque de frein
- **Sentinelle (Ch.2)** → ordre gelé, perfection mécanique, harmonie forcée
- **Archiviste (Ch.3)** → stase mémoire, vérités cachées, autorité silencieuse
- **Cosmos (Ch.4)** → transcendance, fusion ordre/chaos, rédemption possible

### 2. Arc émotionnel

Dialogues en 3 phases: avant combat → pendant → après. Chaque phase révèle plus.

```
AVANT     → Introduction, enjeu révélé, défi lancé
PENDANT   → Réaction au gameplay (Tetris, niveau, avantage joueur)
APRÈS     → Conséquence, transition narrative, leçon apprise
```

### 3. Lien gameplay-narration

Les mécaniques spéciales (Rouille, Éclipse, etc.) sont des manifestations du boss.

**Exemple:** "La Sentinelle te paralyse" → mécanque Éclipse qui ralentit le joueur.

---

## Structure dialogue

### Avant combat

```
"[Boss name] reconnaît ta présence.
L'air se densifie. Tu vois son énergie exploser.
[Défi ou question philosophique]"
```

**Exemple (Brasier):**

```
"Le Brasier reconnaît ton approche.
Les flammes dansent sans direction.
Comprends-tu? Je brûle parce que c'est tout ce que je sais faire."
```

### Pendant combat

- **Après Tetris**: Boss réagit au succès brutal ("Impression de puissance?")
- **Niveau mid-way**: Boss change tactique ou révèle faiblesse
- **Contre-attaque**: Boss riposte, mais dialogue montre sa fragilité

**Exemple (Sentinelle, après Tetris):**

```
"Quatre lignes parfaites. Presque aussi régulier que moi.
Mais la régularité n'est pas la force. C'est une chaîne."
```

### Après combat

- Reconnaître la victoire du joueur
- Révéler une verdité sur soi-même
- Transition vers prochain chapitre/monde

**Exemple (Brasier vaincu):**

```
"Tu as maîtrisé l'informe. C'est ce que je ne pouvais pas faire.
Peut-être que la rédemoption existe pour ceux qui apprennent."
```

---

## Textures narratives par boss

### Brasier (Ch.1) — Chaos

- **Ton:** Passionné, confus, innocent dans sa destruction
- **Motifs:** Feu, croissance incontrôlée, incompréhension de ses actes
- **Arc:** Ignorance → prise de conscience → acceptation

**Dialogues clés:**

```
AVANT:  "Je n'ai jamais appris à m'arrêter."
PENDANT:"Chaque ligne que tu effaces, c'est de moi que tu te libères."
APRÈS:  "Merci de m'avoir montré qu'il existe un ordre."
```

### Sentinelle (Ch.2) — Ordre

- **Ton:** Poli, contrôlé, déterminé, solitaire
- **Motifs:** Géométrie, équilibre, perfection stérile
- **Arc:** Perfection rigide → doute systématique → rédemption par humanité

**Dialogues clés:**

```
AVANT:  "L'ordre doit être préservé. C'est ma fonction."
PENDANT:"Tes mouvements imprévisibles... perturbent mon algorithme."
APRÈS:  "Tu as prouvé que l'ordre sans vie est une prison."
```

### Archiviste (Ch.3) — Stase

- **Ton:** Savant, énigmatique, paternaliste, gardien de secrets
- **Motifs:** Mémoire, codex, révélation progressive
- **Arc:** Connaissance cachée → transmission → acceptation de l'oubli

**Dialogues clés:**

```
AVANT:  "J'ai enregistré tes premiers pas. Je connais déjà ta fin."
PENDANT:"Chaque action que tu fais réécrit l'histoire que j'ai mémorisée."
APRÈS:  "Peut-être que la sagesse réside dans savoir oublier."
```

### Cosmos (Ch.4) — Synthèse

- **Ton:** Mystérieux, poétique, catalyseur de transformation
- **Motifs:** Harmonie chaos/ordre, danse cosmique, transcendance
- **Arc:** Synthèse de tous les boss → révélation finale → choix du joueur

**Dialogues clés:**

```
AVANT:  "Tes trois premiers adversaires t'ont préparé à ceci."
PENDANT:"Maintenant tu comprends: chaos ET ordre coexistent."
APRÈS:  "Le monde change parce que tu as choisi de le voir différemment."
```

---

## Conseils écriture

### ✅ À FAIRE

- Utiliser tu/le joueur comme référence (immersion)
- Lier dialogue au gameplay actuel (Tetris, niveau, mode spécial)
- Créer progression émotionnelle entre phases
- Révéler lentement la nature du boss
- Utiliser poésie/métaphore pour univers fantasy

### ❌ À NE PAS FAIRE

- Explications longues (max 1-2 phrases par dialogue)
- Référence à éléments externes (ne pas mentionner le code ou l'UI)
- Répétition (chaque dialogue apporte nouveau contexte)
- Ton générique/impersonnel (chaque boss = voix unique)

---

## Intégration dans data/histoire-textes.json

```json
{
    "DIALOGUES_COMBAT_BOSS": {
        "boss_id": {
            "presentation": "...",
            "avant": "Dialogue avant combat",
            "tetris": "Réaction spéciale après Tetris",
            "phase2": "Dialogue moitié combat",
            "phase3": "Dialogue fin combat",
            "victoire": "Monologue après défaite",
            "transition": "Lien vers prochain chapitre"
        }
    }
}
```

---

## Checklist dialogue enrichi

Pour chaque boss:

- [ ] Avant: défi + contexte biome
- [ ] Pendant Tetris: réaction à stratégie joueur
- [ ] Phase 2: révélation fragilité boss
- [ ] Phase 3: défi final + prise de conscience
- [ ] Après: acceptation + leçon morale
- [ ] Transition: pont vers prochain monde/boss

Total cible: **5-7 dialogues par boss** (vs 1-3 actuellement)
