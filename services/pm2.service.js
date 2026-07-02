const pm2 = require('pm2');

exports.start = (config) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      pm2.start(config, (err, apps) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve(apps);
      });
    });
  });
};

exports.stop = (name) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      pm2.stop(name, (err) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

exports.restart = (name) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      pm2.restart(name, (err) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

exports.delete = (name) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      pm2.delete(name, (err) => {
        pm2.disconnect();
        if (err) return reject(err);
        resolve();
      });
    });
  });
};

exports.logs = (name, lines = 200) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      pm2.describe(name, (err, details) => {
        pm2.disconnect();
        if (err || !details || details.length === 0) return reject(err || new Error('Process not found'));
        // In a real env, we'd read the log files from details[0].pm2_env.pm_out_log_path and pm_err_log_path
        resolve({ out: details[0].pm2_env.pm_out_log_path, err: details[0].pm2_env.pm_err_log_path });
      });
    });
  });
};

exports.status = (name) => {
  return new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) return reject(err);
      pm2.describe(name, (err, details) => {
        pm2.disconnect();
        if (err || !details || details.length === 0) return resolve(null);
        const d = details[0];
        resolve({
          status: d.pm2_env.status,
          cpu: d.monit.cpu,
          memory: Math.round(d.monit.memory / (1024 * 1024)), // MB
          uptime: Math.round((Date.now() - d.pm2_env.pm_uptime) / 1000)
        });
      });
    });
  });
};
