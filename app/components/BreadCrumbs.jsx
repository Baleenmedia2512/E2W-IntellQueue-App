
import React from 'react';
import { BreadCrumb } from 'primereact/breadcrumb';
import { useDispatch } from 'react-redux';
import { setQuotesData } from '@/redux/features/quote-slice';

export default function BreadCrumbs(availableItems) {
    const dispatch = useDispatch()
    const items = [{label: "adMedium"}]
    const home = { icon: 'pi pi-home', action: dispatch(setQuotesData({currentPage: "adMedium"})) }

    return (
        <BreadCrumb model={items} home={home} />
    )
}
        