import axiosInstance from '../api/axiosInstance';

/**
 * Check serviceability with Velocity API
 * @param {Object} payload
 * @param {string} payload.pincode - Delivery pincode
 * @param {string} [payload.fromPincode='625001'] - Dispatch pincode
 */
export const checkServiceability = async (payload) => {
    try {
        // Map parameters to match backend expectations (fromPincode & toPincode)
        const requestData = {
            fromPincode: payload.fromPincode || payload.pickup_pincode || '625001',
            toPincode: payload.toPincode || payload.delivery_pincode || payload.pincode,
            paymentMode: payload.paymentMode || 'cod',
            shipmentType: payload.shipmentType || 'forward'
        };

        const response = await axiosInstance.post('/velocity/check-serviceability', requestData);
        return response.data;
    } catch (error) {
        console.error('Error checking serviceability via Velocity:', error);
        throw error;
    }
};

/**
 * Track shipment live details by Order Number
 * @param {string} orderNumber - e.g., 'HZORD-1791457320607-7547'
 */
export const trackByOrderNumber = async (orderNumber) => {
    try {
        const response = await axiosInstance.get(`/velocity/track-by-order/${orderNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching live tracking via Velocity:', error);
        throw error;
    }
};

export default {
    checkServiceability,
    trackByOrderNumber
};