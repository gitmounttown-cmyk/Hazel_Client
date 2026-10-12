import axiosInstance from '../api/axiosInstance';

export const checkServiceability = async (payload) => {
    try {
        const requestData = {
            fromPincode: payload.fromPincode || payload.pickup_pincode || '641301',
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

export const manifestForwardOrder = async (orderPayload) => {
    try {
        const response = await axiosInstance.post('/velocity/manifest-order', orderPayload);
        return response.data;
    } catch (error) {
        console.error('Error manifesting order with Velocity:', error);
        throw error;
    }
};

export const trackByOrderNumber = async (orderNumber) => {
    try {
        const response = await axiosInstance.get(`/velocity/track/${orderNumber}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching live tracking via Velocity:', error);
        throw error;
    }
};

export default {
    checkServiceability,
    manifestForwardOrder,
    trackByOrderNumber
};