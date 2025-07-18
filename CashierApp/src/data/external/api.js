import axios from "axios";
import { decodeJwt } from "jose";

const API_BASE = "http://localhost:8002";

export async function sendLogInRequest(payload) {
    try {
        const response = await axios.post(`${API_BASE}/cashier/login`, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        return { status: response.status, data: response.data };
    } catch (error) {
        if (error.response) {
            return {
                status: error.response.status,
                data: error.response.data,
            };
        } else {
            return {
                status: 0,
                data: { detail: "Network error" },
            };
        }
    }
}

export async function fetchShopItems(token) {
    try {
        const response = await axios.get(`${API_BASE}/cashier/inventory`, {
            headers: {
                token: token,
            },
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Unknown error" },
        };
    }
}

export async function fetchUserProfile(token, username) {
    try {
        const response = await axios.get(`${API_BASE}/cashier/get_user_by_user_name/${username}`, {
            headers: {
                token: token,
            },
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Unknown error" },
        };
    }
}

export async function renameUID(token, oldUid, newUid) {
    try {
        const response = await axios.post(
            `${API_BASE}/cashier/merge_users`,
            {
                old_uid: oldUid,
                new_uid: newUid,
            },
            {
                headers: {
                    token: token,
                },
            }
        );

        return {
            status: response.status,
            data: response.data,
        };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Unknown error" },
        };
    }
}

export async function uploadFaceImage(blob, token) {
    const formData = new FormData();
    const timestamp = Date.now();
    const decoded = decodeJwt(token);
    const cashierId = decoded.entity_id || decoded.shop_id || "debug";
    formData.append("file", blob, `face-${timestamp}-${cashierId}.jpg`);

    try {
        const response = await axios.post(`${API_BASE}/recognise/`, formData, {
            headers: {
                token: token,
            },
            timeout: 10000,
        });
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Upload failed:", error);
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Upload failed" },
        };
    }
}

export async function reportConfusedUser(token, recognisedUid, foundUid) {
    const timestamp = Date.now();

    try {
        const response = await axios.post(
            `${API_BASE}/cashier/confused_users`,
            {
                recognised_uid: recognisedUid,
                found_uid: foundUid,
                timestamp: timestamp
            },
            {
                headers: {
                    token: token
                }
            }
        );
        return { status: response.status, data: response.data };
    } catch (error) {
        console.error("Failed to report confused user:", error);
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Unknown error" },
        };
    }
}

export async function getItemsDetails(token, itemIdList) {
    try {
        const response = await axios.post(
            `${API_BASE}/cashier/get_items_details`,
            { item_id_list: itemIdList },
            {
                headers: {
                    token: token
                },
            }
        );
        return { status: response.status, data: response.data };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Unknown error" },
        };
    }
}

export async function createTransaction(token, body) {
    try {
        const response = await axios.post(
            `${API_BASE}/cashier/record_transaction`,
            body,
            {
                headers: {
                    token: token
                }
            }
        );
        return { status: response.status, data: response.data };
    } catch (error) {
        return {
            status: error.response?.status || 500,
            data: error.response?.data || { detail: "Unknown error" },
        };
    }
}