import {
    Box,
    Image,
    Heading,
    Text,
    Badge,
    HStack,
    Button,
    Input, VStack,
} from "@chakra-ui/react";
import { useCart } from "../context/CartContext";

// create a component for a single product card
export default function ProductCard({ item }) {
    // note: iid = item id
    const { selectedItems, updateItem } = useCart(); // use cart context
    const count = selectedItems[item.iid] || 0; // get the quantity of product or 0

    const increment = () => updateItem(item.iid, count + 1);
    // ensure its impossible to have negative quantity
    const decrement = () => updateItem(item.iid, Math.max(count - 1, 0));
    // provide option to write the value in ui
    const handleInputChange = (e) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value)) {
            updateItem(item.iid, Math.max(value, 0));
        }
    };

    // an item card displaying an image (or a gray box with "No Photo" label) and all other data from backend.
    // note - backend returns the price in fills, so the price in frontend has to be divided by 100
    return (
        <Box borderWidth="1px" borderRadius="xl" overflow="hidden" p={4} shadow="md">
            {item.photo_url ? (
                <Image src={item.photo_url} alt={item.name} borderRadius="md" mb={3} />
            ) : (
                <Box
                    height="150px"
                    bg="gray.100"
                    borderRadius="md"
                    mb={3}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color="gray.500"
                >
                    No Photo
                </Box>
            )}

            <VStack spacing={3}>
                <Heading fontSize="lg">{item.name}</Heading>
                <Text fontSize="sm" color="gray.600">
                    {item.description}
                </Text>
                <Text fontWeight="bold">Price: {item.price / 100} AED</Text>
                <Badge colorPalette="green">Points: {item.percent_point_allocation}%</Badge>

                <HStack mt={2}>
                    <Button size="sm" onClick={decrement} disabled={count <= 0}>−</Button>
                    <Input
                        value={count}
                        onChange={handleInputChange}
                        type="number"
                        size="sm"
                        maxW="60px"
                        textAlign="center"
                    />
                    <Button size="sm" onClick={increment}>+</Button>
                    <Text>{count > 0 ? "Selected" : "Not selected"}</Text>
                </HStack>
            </VStack>
        </Box>
    );
}
