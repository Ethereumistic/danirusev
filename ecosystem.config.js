module.exports = {
    apps: [{
        name: "danirusev",
        script: "node_modules/next/dist/bin/next",
        args: "start --port 3000",
        interpreter: "bun",
        exec_mode: "fork",            // Fork mode is perfect for single instances
        instances: 1,                 // Leaving the other core free for Nginx & future sites
        watch: false,
        max_memory_restart: "1G",     // Hard cap to keep the VPS healthy
        exp_backoff_restart_delay: 100,
        env: {
            NODE_ENV: "production",
            PORT: 3000
        },
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss Z",
        merge_logs: true
    }]
}