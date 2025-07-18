import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
    // store items selected by user
    const [selectedItems, setSelectedItems] = useState({});

    // update the cart, deleting items which count becomes zero
    const updateItem = (id, count) => {
        setSelectedItems((prev) => {
            if (count === 0) {
                const newItems = { ...prev };
                delete newItems[id];
                return newItems;
            }
            return { ...prev, [id]: count };
        });
    };
    // used when we press next customer in UI
    const clearCart = () => {
        setSelectedItems({});
    };

    return (
        <CartContext.Provider value={{ selectedItems, updateItem, clearCart }}>
            {children}
        </CartContext.Provider>
    );
}

// export a custom react hook to access selectedItems, updateItem, clearCart
export const useCart = () => useContext(CartContext);
