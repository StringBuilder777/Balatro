import "./DeckView.css"
import { useMemo } from "react"
import { useSelector } from "react-redux"

// Orden visual del modal (de arriba abajo: picas, corazones, tréboles, diamantes).
const SUIT_ORDER = [
    { key: 'Spread', symbol: '♠', cls: 'spades' },
    { key: 'Heart', symbol: '♥', cls: 'hearts' },
    { key: 'Club', symbol: '♣', cls: 'clubs' },
    { key: 'Diamond', symbol: '♦', cls: 'diamonds' },
]
const RANK_ORDER = ['Ace', 'King', 'Queen', 'Jack', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const RANK_LABELS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']

const CARD_SCALE = 0.5
const SHEET_W = 1846 * CARD_SCALE
const CARD_W = 142 * CARD_SCALE
const CARD_H = 190 * CARD_SCALE

const DeckView = ({ onClose }) => {
    const { DeckAllGame, remainingCards } = useSelector(s => s.DrawCardReducer)

    // "Disponible" = aún en el mazo. Las cartas en mano, jugadas o descartadas
    // se atenúan (igual que el panel "Remaining" de Balatro).
    const availableIds = useMemo(() => {
        const set = new Set()
        remainingCards.forEach(c => set.add(c.id))
        return set
    }, [remainingCards])

    const lookup = useMemo(() => {
        const map = {}
        DeckAllGame.forEach(c => { map[`${c.suit}-${c.rank}`] = c })
        return map
    }, [DeckAllGame])

    // Totales por rango/palo, contando solo las disponibles (en mazo o mano).
    const rankTotals = RANK_ORDER.map(r =>
        SUIT_ORDER.reduce((acc, su) => {
            const c = lookup[`${su.key}-${r}`]
            return acc + (c && availableIds.has(c.id) ? 1 : 0)
        }, 0)
    )
    const suitTotals = SUIT_ORDER.map(su =>
        RANK_ORDER.reduce((acc, r) => {
            const c = lookup[`${su.key}-${r}`]
            return acc + (c && availableIds.has(c.id) ? 1 : 0)
        }, 0)
    )

    return (
        <div className="deck-view-overlay" onClick={onClose}>
            <div className="deck-view-modal" onClick={e => e.stopPropagation()}>
                <div className="deck-view-header">Full Deck</div>

                <div className="deck-view-body">
                    <div className="deck-view-sidebar">
                        <div className="deck-view-rank-summary">
                            {RANK_LABELS.map((l, i) => (
                                <div key={l} className="deck-view-rank-row">
                                    <span className="rank-label">{l}</span>
                                    <span className="rank-count">{rankTotals[i]}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="deck-view-grid">
                        {SUIT_ORDER.map((su, si) => (
                            <div key={su.key} className="deck-view-row">
                                <div className={`deck-view-suit-badge ${su.cls}`}>
                                    <span className={`suit-icon ${su.cls}`}>{su.symbol}</span>
                                    <span className="suit-count">{suitTotals[si]}</span>
                                </div>
                                {RANK_ORDER.map(rank => {
                                    const card = lookup[`${su.key}-${rank}`]
                                    if (!card) return null
                                    const available = availableIds.has(card.id)
                                    const pos = card.position
                                    return (
                                        <div
                                            key={card.id}
                                            className={`deck-view-card ${available ? '' : 'used'}`}
                                            style={{
                                                width: CARD_W,
                                                height: CARD_H,
                                                backgroundImage: `url('${process.env.PUBLIC_URL}/assets/basic-card.png')`,
                                                backgroundSize: `${SHEET_W}px`,
                                                backgroundPosition: `${pos.width * CARD_SCALE}px ${pos.height * CARD_SCALE}px`,
                                                backgroundRepeat: 'no-repeat',
                                            }}
                                        />
                                    )
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="deck-view-footer">
                    <button className="deck-view-close pixel-corners" onClick={onClose}>Back</button>
                </div>
            </div>
        </div>
    )
}

export default DeckView
