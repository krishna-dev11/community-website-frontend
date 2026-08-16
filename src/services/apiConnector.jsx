import axios from "axios"

export const axiosInstance = axios.create({});

export const apiConnector = (method, url, bodyData, headersOrConfig, params) => {
    const hasAdvancedConfig =
        headersOrConfig &&
        (Object.prototype.hasOwnProperty.call(headersOrConfig, "withCredentials") ||
            Object.prototype.hasOwnProperty.call(headersOrConfig, "headers") ||
            Object.prototype.hasOwnProperty.call(headersOrConfig, "responseType") ||
            Object.prototype.hasOwnProperty.call(headersOrConfig, "timeout"));

    const requestConfig = hasAdvancedConfig
        ? { ...headersOrConfig }
        : {
              headers: headersOrConfig || null,
          };

    if (params) {
        requestConfig.params = params;
    }

    return axiosInstance({
        method: `${method}`,
        url: `${url}`,
        data: bodyData ? bodyData : null,
        ...requestConfig,
    });
}
