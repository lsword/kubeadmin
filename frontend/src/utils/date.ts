const formatTimeDiff = (createTime: any, currentTime: any) => {
  const timeDiff = Math.floor((currentTime - createTime) / 1000);
  let formattedTimeDiff = '';

  // 如果时间差为负数，将其设置为零
  const nonNegativeTimeDiff = Math.max(timeDiff, 0);

  if (nonNegativeTimeDiff < 60) {
      formattedTimeDiff = `${nonNegativeTimeDiff}秒前`;
  } else if (nonNegativeTimeDiff < 3600) {
      const minutesDiff = Math.floor(nonNegativeTimeDiff / 60);
      formattedTimeDiff = `${minutesDiff}分钟前`;
  } else if (nonNegativeTimeDiff < 86400) {
      const hoursDiff = Math.floor(nonNegativeTimeDiff / 3600);
      formattedTimeDiff = `${hoursDiff}小时前`;
  } else if (nonNegativeTimeDiff < 31536000) {
      const daysDiff = Math.floor(nonNegativeTimeDiff / 86400);
      formattedTimeDiff = `${daysDiff}天前`;
  } else {
      const yearsDiff = Math.floor(nonNegativeTimeDiff / 31536000);
      formattedTimeDiff = `${yearsDiff}年前`;
  }

  return formattedTimeDiff;
};

export default {
  formatTimeDiff,
};
