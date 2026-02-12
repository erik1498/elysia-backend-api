export const AppUtil = {
    checkProductionType: () => {
        return Bun.env.NODE_ENV === 'production';
    }
}