export type OnePasswordResponse = {
    id: string;
    title: string;
    fields: {
        id: string;
        section: {
            id: string;
            label: string;
        };
        type: string;
        label: string;
        value: string;
        reference: string;
    }[];
}