import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';
import { useAdmin } from './AdminContext';

const defaultHeroContext = {
    heroSlides: [],
    isLoading: false,
    addHeroSlide: async () => {},
    updateHeroSlide: async () => {},
    deleteHeroSlide: async () => {},
    reorderHeroSlides: async () => {},
};

const HeroContext = createContext(defaultHeroContext);

export const HeroProvider = ({ children }) => {
    const { showToast } = useAdmin();
    const [heroSlides, setHeroSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchHeroSlides = async () => {
        setIsLoading(true);
        try {
            // Fetch slides with admin=true to get all slides (including inactive)
            const response = await api.get('/api/hero?admin=true');
            const data = response.data.data.map(slide => ({
                id: slide._id,
                title: slide.title,
                subtitle: slide.subtitle,
                image: slide.image,
                ctaText: slide.ctaText,
                ctaLink: slide.ctaLink,
                isActive: slide.isActive,
                order: slide.order
            }));
            setHeroSlides(data);
        } catch (error) {
            console.error("Failed to fetch hero slides:", error);
            showToast('danger', 'Error', 'Failed to fetch hero slides.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchHeroSlides();
    }, []);

    const addHeroSlide = async (slideData) => {
        try {
            const response = await api.post('/api/hero', slideData);
            const slide = response.data.data;
            const newSlide = {
                id: slide._id,
                title: slide.title,
                subtitle: slide.subtitle,
                image: slide.image,
                ctaText: slide.ctaText,
                ctaLink: slide.ctaLink,
                isActive: slide.isActive,
                order: slide.order
            };
            setHeroSlides(prev => [...prev, newSlide]);
            showToast('success', 'Hero Slide Added', 'New editorial banner added.');
        } catch (error) {
            console.error('Failed to add hero slide:', error);
            showToast('danger', 'Error', 'Failed to add hero slide.');
        }
    };

    const updateHeroSlide = async (id, updates) => {
        try {
            const response = await api.put(`/api/hero/${id}`, updates);
            const slide = response.data.data;
            setHeroSlides(prev => prev.map(s => s.id === id ? {
                ...s,
                title: slide.title,
                subtitle: slide.subtitle,
                image: slide.image,
                ctaText: slide.ctaText,
                ctaLink: slide.ctaLink,
                isActive: slide.isActive,
                order: slide.order
            } : s));
            showToast('success', 'Hero Carousel Updated', 'Editorial slide saved.');
        } catch (error) {
            console.error('Failed to update hero slide:', error);
            showToast('danger', 'Error', 'Failed to update hero slide.');
        }
    };

    const deleteHeroSlide = async (id) => {
        try {
            await api.delete(`/api/hero/${id}`);
            setHeroSlides(prev => prev.filter(s => s.id !== id));
            showToast('warning', 'Slide Removed', 'Hero slide deleted.');
        } catch (error) {
            console.error('Failed to delete hero slide:', error);
            showToast('danger', 'Error', 'Failed to delete hero slide.');
        }
    };

    const reorderHeroSlides = async (slideA, slideB) => {
        // Optimistic update
        const originalSlides = [...heroSlides];
        setHeroSlides(prev => prev.map(s => {
            if (s.id === slideA.id) return { ...s, order: slideB.order };
            if (s.id === slideB.id) return { ...s, order: slideA.order };
            return s;
        }).sort((a, b) => a.order - b.order));

        try {
            await api.put('/api/hero/reorder', {
                slides: [
                    { id: slideA.id, order: slideB.order },
                    { id: slideB.id, order: slideA.order }
                ]
            });
            showToast('info', 'Slide Sequence Updated', 'Hero carousel presentation order updated.');
        } catch (error) {
            console.error('Failed to reorder hero slides:', error);
            // Revert on failure
            setHeroSlides(originalSlides);
            showToast('danger', 'Error', 'Failed to reorder hero slides.');
        }
    };

    return (
        <HeroContext.Provider value={{
            heroSlides,
            isLoading,
            addHeroSlide,
            updateHeroSlide,
            deleteHeroSlide,
            reorderHeroSlides
        }}>
            {children}
        </HeroContext.Provider>
    );
};

export const useHero = () => {
    const context = useContext(HeroContext);
    return context || defaultHeroContext;
};

export default HeroContext;
