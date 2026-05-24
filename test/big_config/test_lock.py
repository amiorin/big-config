from big_config import PROCS, lock, run


def recording_runner(log):
    def _runner(shell_opts, cmd):
        log.append({"shell-opts": shell_opts, "cmd": cmd})
        return {"exit": 0, "out": "", "err": "", "cmd": cmd}

    return _runner


def last_cmd(opts):
    return opts[PROCS][-1]["cmd"]


def test_lock_commands_are_argv_vectors(monkeypatch):
    opts = {lock.LOCK_NAME: "LOCK-DEAD"}
    log = []
    monkeypatch.setattr(run, "runner", recording_runner(log))
    assert last_cmd(lock.delete_tag(opts)) == ["git", "tag", "-d", "LOCK-DEAD"]
    assert last_cmd(lock.push_tag(opts)) == ["git", "push", "origin", "LOCK-DEAD"]
    assert last_cmd(lock.delete_remote_tag(opts)) == ["git", "push", "--delete", "origin", "LOCK-DEAD"]
    assert last_cmd(lock.get_remote_tag(opts)) == ["git", "fetch", "origin", "tag", "LOCK-DEAD", "--no-tags"]
    assert last_cmd(lock.read_tag(opts)) == ["git", "cat-file", "-p", "LOCK-DEAD"]
    assert last_cmd(lock.check_remote_tag(opts)) == ["git", "ls-remote", "--exit-code", "origin", "refs/tags/LOCK-DEAD"]


def test_create_tag_passes_lock_details_via_stdin(monkeypatch):
    opts = {lock.LOCK_NAME: "LOCK-DEAD", lock.LOCK_DETAILS: {lock.OWNER: "alberto"}}
    log = []
    monkeypatch.setattr(run, "runner", recording_runner(log))
    lock.create_tag(opts)
    assert log[-1]["cmd"] == ["git", "tag", "-a", "LOCK-DEAD", "-F", "-"]
    assert log[-1]["shell-opts"]["in"].startswith(">>>")


def test_malicious_lock_name_stays_single_argument(monkeypatch):
    evil = "LOCK-x; rm -rf / #"
    log = []
    monkeypatch.setattr(run, "runner", recording_runner(log))
    assert last_cmd(lock.delete_tag({lock.LOCK_NAME: evil})) == ["git", "tag", "-d", evil]
