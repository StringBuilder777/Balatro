import "./Deck.css"
import { useState } from "react"
import { useSelector } from "react-redux"
import DeckHoverPreview from "./DeckHoverPreview"
import DeckView from "./DeckView"

const Deck = () => {
    const { DeckAllGame, remainingCards } = useSelector(s => s.DrawCardReducer)
    const [hovered, setHovered] = useState(false)
    const [open, setOpen] = useState(false)

    const total = DeckAllGame.length || 52
    const remaining = remainingCards.length
    // Espesor del mazo escala con cantidad restante (1..5 capas visuales).
    const layers = Math.max(1, Math.min(5, Math.ceil(remaining / 11)))

    const backStyle = {
        backgroundImage: `url('${process.env.PUBLIC_URL}/assets/deck/Balatro-red_deck.webp')`,
    }

    return (
        <>
            <div
                className="deck"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                onClick={() => setOpen(true)}
            >
                <div className="deck-stack">
                    {Array.from({ length: layers }).map((_, i) => {
                        const offset = (layers - 1 - i) * 2
                        return (
                            <div
                                key={i}
                                className="deck-back"
                                style={{
                                    ...backStyle,
                                    transform: `translate(${offset}px, ${offset}px)`,
                                    zIndex: i,
                                }}
                            />
                        )
                    })}
                </div>
                <div className="deck-count">{remaining}/{total}</div>
                {hovered && !open && (
                    <DeckHoverPreview cards={remainingCards} />
                )}
            </div>
            {open && <DeckView onClose={() => setOpen(false)} />}
        </>
    )
}


export default Deck
