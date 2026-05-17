import "./DeckHoverPreview.css"

const RANKS = ['Ace', 'King', 'Queen', 'Jack', '10', '9', '8', '7', '6', '5', '4', '3', '2']
const RANK_LABELS = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2']
// 'Spread' es el nombre interno del palo de picas en este repo (ver Deck/Deck.js)
const SUITS = [
    { key: 'Spread', symbol: '♠', cls: 'spades' },
    { key: 'Heart', symbol: '♥', cls: 'hearts' },
    { key: 'Club', symbol: '♣', cls: 'clubs' },
    { key: 'Diamond', symbol: '♦', cls: 'diamonds' },
]

const DeckHoverPreview = ({ cards }) => {
    const counts = {}
    SUITS.forEach(s => {
        counts[s.key] = {}
        RANKS.forEach(r => { counts[s.key][r] = 0 })
    })
    cards.forEach(c => {
        if (counts[c.suit] && counts[c.suit][c.rank] !== undefined) {
            counts[c.suit][c.rank]++
        }
    })
    const rankTotals = RANKS.map(r => SUITS.reduce((acc, su) => acc + counts[su.key][r], 0))
    const suitTotals = SUITS.map(su => RANKS.reduce((acc, r) => acc + counts[su.key][r], 0))

    return (
        <div className="deck-hover-preview">
            <table>
                <thead>
                    <tr className="rank-header">
                        <th colSpan={2}></th>
                        {RANK_LABELS.map(l => <th key={l}>{l}</th>)}
                    </tr>
                    <tr className="rank-totals">
                        <th colSpan={2}></th>
                        {rankTotals.map((t, i) => <td key={i}>{t}</td>)}
                    </tr>
                </thead>
                <tbody>
                    {SUITS.map((su, i) => (
                        <tr key={su.key} className={`suit-row ${su.cls}`}>
                            <th className="suit-icon-cell">
                                <span className={`suit-icon ${su.cls}`}>{su.symbol}</span>
                            </th>
                            <td className="suit-total">{suitTotals[i]}</td>
                            {RANKS.map(r => {
                                const v = counts[su.key][r]
                                return (
                                    <td key={r} className={v === 0 ? 'zero' : ''}>{v}</td>
                                )
                            })}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}

export default DeckHoverPreview
