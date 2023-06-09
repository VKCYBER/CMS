export const getDefaultLayout = () => {
    return {
        lg: [ // 12 cols
        /**      */    { i: 'productRating', x: 0, y: 0, w: 4, h: 3, minH: 3, minW: 3 },
        /**         */    { i: 'salesValue', x: 4, y: 0, w: 4, h: 3, minH: 3, minW: 3 },
        /**          */    { i: 'pageViews', x: 8, y: 0, w: 4, h: 3, minH: 3, minW: 3 },
        /** */    { i: 'salesValueLastWeek', x: 0, y: 3, w: 7, h: 8, minH: 6 },
        /**     */    { i: 'pageViewsStats', x: 7, y: 3, w: 5, h: 8, minH: 3 },
        /**     */    { i: 'ordersLastWeek', x: 0, y: 10, w: 6, h: 8, minH: 6 },
        /**     */    { i: 'productReviews', x: 6, y: 10, w: 6, h: 8, minH: 4 },
        ],
        md: [ // 9 cols
        /**      */    { i: 'productRating', x: 0, y: 0, w: 3, h: 3, minH: 3, minW: 2 },
        /**         */    { i: 'salesValue', x: 3, y: 0, w: 3, h: 3, minH: 3, minW: 2 },
        /**          */    { i: 'pageViews', x: 6, y: 0, w: 3, h: 3, minH: 3, minW: 2 },
        /** */    { i: 'salesValueLastWeek', x: 0, y: 3, w: 6, h: 8, minH: 6 },
        /**     */    { i: 'pageViewsStats', x: 6, y: 3, w: 3, h: 8, minH: 3 },
        /**     */    { i: 'ordersLastWeek', x: 0, y: 10, w: 5, h: 8, minH: 6 },
        /**     */    { i: 'productReviews', x: 5, y: 10, w: 4, h: 8, minH: 4 },
        ],
        sm: [ // 6 cols
        /**      */    { i: 'productRating', x: 0, y: 0, w: 2, h: 3, minH: 3, minW: 2 },
        /**         */    { i: 'salesValue', x: 2, y: 0, w: 2, h: 3, minH: 3, minW: 2 },
        /**          */    { i: 'pageViews', x: 4, y: 0, w: 2, h: 3, minH: 3, minW: 2 },
        /** */    { i: 'salesValueLastWeek', x: 0, y: 3, w: 3, h: 8, minH: 2 },
        /**     */    { i: 'pageViewsStats', x: 3, y: 3, w: 3, h: 8, minH: 2 },
        /**     */    { i: 'ordersLastWeek', x: 0, y: 10, w: 3, h: 8, minH: 2 },
        /**     */    { i: 'productReviews', x: 3, y: 10, w: 3, h: 8, minH: 4 },
        ],
        xs: [ // 4 cols
        /**      */    { i: 'productRating', x: 0, y: 0, w: 2, h: 3, minH: 3, minW: 2 },
        /**         */    { i: 'salesValue', x: 2, y: 0, w: 2, h: 3, minH: 3, minW: 2 },
        /**          */    { i: 'pageViews', x: 0, y: 0, w: 2, h: 3, minH: 3, minW: 2 },
        /** */    { i: 'salesValueLastWeek', x: 0, y: 3, w: 2, h: 8, minH: 2 },
        /**     */    { i: 'pageViewsStats', x: 2, y: 3, w: 2, h: 8, minH: 2 },
        /**     */    { i: 'ordersLastWeek', x: 0, y: 10, w: 2, h: 8, minH: 3 },
        /**     */    { i: 'productReviews', x: 2, y: 10, w: 2, h: 8, minH: 3 },
        ],
        xxs: [ // 2 col
        /**      */    { i: 'productRating', x: 0, y: 0, w: 1, h: 3, minH: 3, minW: 1 },
        /**         */    { i: 'salesValue', x: 1, y: 0, w: 1, h: 3, minH: 3, minW: 1 },
        /**          */    { i: 'pageViews', x: 0, y: 3, w: 2, h: 3, minH: 3, minW: 2 },
        /** */    { i: 'salesValueLastWeek', x: 0, y: 6, w: 2, h: 8, minH: 2 },
        /**     */    { i: 'pageViewsStats', x: 0, y: 6, w: 2, h: 8, minH: 2 },
        /**     */    { i: 'ordersLastWeek', x: 0, y: 14, w: 2, h: 6, minH: 2 },
        /**     */    { i: 'productReviews', x: 0, y: 20, w: 2, h: 8, minH: 3 },
        ],
    }
}