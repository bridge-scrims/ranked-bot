import { apiURL } from "../../..";
import { ScrimsUserData } from "../../../../types";

export const getUser = async (uuid: string): Promise<ScrimsUserData | undefined> => {
    const data = (await (await fetch(`${apiURL}/user?uuid=${uuid}`)).json()) as {
        success: boolean;
        user_data: ScrimsUserData;
    };
    if (!data.success) {
        return undefined;
    }

    return data.user_data;
};

export const getUserByUsername = async (username: string): Promise<ScrimsUserData | undefined> => {
    const data = (await (await fetch(`${apiURL}/user?username=${username}`)).json()) as {
        success: boolean;
        user_data: ScrimsUserData;
    };
    if (!data.success) {
        return undefined;
    }

    return data.user_data;
};
