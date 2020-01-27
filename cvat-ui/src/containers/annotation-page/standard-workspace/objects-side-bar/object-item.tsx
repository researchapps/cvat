import React from 'react';
import { connect } from 'react-redux';
import {
    CombinedState,
} from 'reducers/interfaces';
import {
    collapseObjectItems,
    updateAnnotationsAsync,
    changeFrameAsync,
    activateObject as activateObjectAction,
} from 'actions/annotation-actions';

import ObjectStateItemComponent from 'components/annotation-page/standard-workspace/objects-side-bar/object-item';

interface OwnProps {
    clientID: number;
}

interface StateToProps {
    objectState: any;
    collapsed: boolean;
    labels: any[];
    attributes: any[];
    jobInstance: any;
    frameNumber: number;
    activated: boolean;
}

interface DispatchToProps {
    changeFrame(frame: number): void;
    updateState(sessionInstance: any, frameNumber: number, objectState: any): void;
    collapseOrExpand(objectStates: any[], collapsed: boolean): void;
    activateObject: (activatedStateID: number | null) => void;
}

function mapStateToProps(state: CombinedState, own: OwnProps): StateToProps {
    const {
        annotation: {
            annotations: {
                states,
                collapsed: statesCollapsed,
                activatedStateID,
            },
            job: {
                labels,
                attributes: jobAttributes,
                instance: jobInstance,
            },
            player: {
                frame: {
                    number: frameNumber,
                },
            },
        },
    } = state;

    const index = states
        .map((_state: any): number => _state.clientID)
        .indexOf(own.clientID);

    const collapsedState = typeof (statesCollapsed[own.clientID]) === 'undefined'
        ? true : statesCollapsed[own.clientID];

    return {
        objectState: states[index],
        collapsed: collapsedState,
        attributes: jobAttributes[states[index].label.id],
        labels,
        jobInstance,
        frameNumber,
        activated: activatedStateID === own.clientID,
    };
}

function mapDispatchToProps(dispatch: any): DispatchToProps {
    return {
        changeFrame(frame: number): void {
            dispatch(changeFrameAsync(frame));
        },
        updateState(sessionInstance: any, frameNumber: number, state: any): void {
            dispatch(updateAnnotationsAsync(sessionInstance, frameNumber, [state]));
        },
        collapseOrExpand(objectStates: any[], collapsed: boolean): void {
            dispatch(collapseObjectItems(objectStates, collapsed));
        },
        activateObject(activatedStateID: number | null): void {
            dispatch(activateObjectAction(activatedStateID));
        },
    };
}

type Props = StateToProps & DispatchToProps;
class ObjectItemContainer extends React.PureComponent<Props> {
    private navigateFirstKeyframe = (): void => {
        const {
            objectState,
            changeFrame,
            frameNumber,
        } = this.props;

        const { first } = objectState.keyframes;
        if (first !== frameNumber) {
            changeFrame(first);
        }
    };

    private navigatePrevKeyframe = (): void => {
        const {
            objectState,
            changeFrame,
            frameNumber,
        } = this.props;

        const { prev } = objectState.keyframes;
        if (prev !== null && prev !== frameNumber) {
            changeFrame(prev);
        }
    };

    private navigateNextKeyframe = (): void => {
        const {
            objectState,
            changeFrame,
            frameNumber,
        } = this.props;

        const { next } = objectState.keyframes;
        if (next !== null && next !== frameNumber) {
            changeFrame(next);
        }
    };

    private navigateLastKeyframe = (): void => {
        const {
            objectState,
            changeFrame,
            frameNumber,
        } = this.props;

        const { last } = objectState.keyframes;
        if (last !== frameNumber) {
            changeFrame(last);
        }
    };

    private activate = (): void => {
        const {
            activateObject,
            objectState,
        } = this.props;

        activateObject(objectState.clientID);
    };

    private lock = (): void => {
        const { objectState } = this.props;
        objectState.lock = true;
        this.commit();
    };

    private unlock = (): void => {
        const { objectState } = this.props;
        objectState.lock = false;
        this.commit();
    };

    private show = (): void => {
        const { objectState } = this.props;
        objectState.hidden = false;
        this.commit();
    };

    private hide = (): void => {
        const { objectState } = this.props;
        objectState.hidden = true;
        this.commit();
    };

    private setOccluded = (): void => {
        const { objectState } = this.props;
        objectState.occluded = true;
        this.commit();
    };

    private unsetOccluded = (): void => {
        const { objectState } = this.props;
        objectState.occluded = false;
        this.commit();
    };

    private setOutside = (): void => {
        const { objectState } = this.props;
        objectState.outside = true;
        this.commit();
    };

    private unsetOutside = (): void => {
        const { objectState } = this.props;
        objectState.outside = false;
        this.commit();
    };

    private setKeyframe = (): void => {
        const { objectState } = this.props;
        objectState.keyframe = true;
        this.commit();
    };

    private unsetKeyframe = (): void => {
        const { objectState } = this.props;
        objectState.keyframe = false;
        this.commit();
    };

    private collapse = (): void => {
        const {
            collapseOrExpand,
            objectState,
            collapsed,
        } = this.props;

        collapseOrExpand([objectState], !collapsed);
    };

    private changeLabel = (labelID: string): void => {
        const {
            objectState,
            labels,
        } = this.props;

        const [label] = labels.filter((_label: any): boolean => _label.id === +labelID);
        objectState.label = label;
        this.commit();
    };

    private changeAttribute = (id: number, value: string): void => {
        const { objectState } = this.props;
        const attr: Record<number, string> = {};
        attr[id] = value;
        objectState.attributes = attr;
        this.commit();
    };

    private commit(): void {
        const {
            objectState,
            updateState,
            jobInstance,
            frameNumber,
        } = this.props;

        updateState(jobInstance, frameNumber, objectState);
    }

    public render(): JSX.Element {
        const {
            objectState,
            collapsed,
            labels,
            attributes,
            frameNumber,
            activated,
        } = this.props;

        const {
            first,
            prev,
            next,
            last,
        } = objectState.keyframes;

        return (
            <ObjectStateItemComponent
                activated={activated}
                objectType={objectState.objectType}
                shapeType={objectState.shapeType}
                clientID={objectState.clientID}
                occluded={objectState.occluded}
                outside={objectState.outside}
                locked={objectState.lock}
                hidden={objectState.hidden}
                keyframe={objectState.keyframe}
                attrValues={{ ...objectState.attributes }}
                labelID={objectState.label.id}
                color={objectState.color}
                attributes={attributes}
                labels={labels}
                collapsed={collapsed}
                navigateFirstKeyframe={
                    first === frameNumber
                        ? null : this.navigateFirstKeyframe
                }
                navigatePrevKeyframe={
                    prev === frameNumber || prev === null
                        ? null : this.navigatePrevKeyframe
                }
                navigateNextKeyframe={
                    next === frameNumber || next === null
                        ? null : this.navigateNextKeyframe
                }
                navigateLastKeyframe={
                    last <= frameNumber
                        ? null : this.navigateLastKeyframe
                }
                activate={this.activate}
                setOccluded={this.setOccluded}
                unsetOccluded={this.unsetOccluded}
                setOutside={this.setOutside}
                unsetOutside={this.unsetOutside}
                setKeyframe={this.setKeyframe}
                unsetKeyframe={this.unsetKeyframe}
                lock={this.lock}
                unlock={this.unlock}
                hide={this.hide}
                show={this.show}
                changeLabel={this.changeLabel}
                changeAttribute={this.changeAttribute}
                collapse={this.collapse}
            />
        );
    }
}

export default connect<StateToProps, DispatchToProps, OwnProps, CombinedState>(
    mapStateToProps,
    mapDispatchToProps,
)(ObjectItemContainer);